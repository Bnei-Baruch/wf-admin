import React, {Component, createRef} from 'react';
import DatePicker from 'react-datepicker';
import {Button, Dropdown, Grid, Header, Icon, Label, List, Message, Segment, Table} from 'semantic-ui-react';
import Hls from 'hls.js';
import {fetchUnits, toHms, getToken} from '../../shared/tools';
import he from 'date-fns/locale/he';

const CONTENT_TYPES = [
    {key: 'LESSON_PART', text: 'Lesson Part', value: 'LESSON_PART'},
    {key: 'FULL_LESSON', text: 'Full Lesson', value: 'FULL_LESSON'},
    {key: 'CLIP', text: 'Clip', value: 'CLIP'},
    {key: 'EVENT_PART', text: 'Event Part', value: 'EVENT_PART'},
    {key: 'MEAL', text: 'Meal', value: 'MEAL'},
    {key: 'VIDEO_PROGRAM_CHAPTER', text: 'TV Chapter', value: 'VIDEO_PROGRAM_CHAPTER'},
];

class ClipsApp extends Component {

    state = {
        startDate: new Date(),
        date: new Date().toLocaleDateString('sv'),
        content_type: 'LESSON_PART',
        units: [],
        loading: false,
        selected_unit: null,
        selected_file: null,
        mp4_file: null,
        hls_url: null,
        clips: [],
        in_point: null,
        preview_clip: null,
        preview_playing: false,
        preview_progress: 0,
        saving: false,
        vod_uid: null,
        save_error: null,
    };

    videoRef = createRef();
    previewRef = createRef();
    hls = null;
    hlsPreview = null;

    componentWillUnmount() {
        this.destroyHls();
        this.destroyHlsPreview();
    }

    destroyHlsPreview = () => {
        if (this.hlsPreview) {
            this.hlsPreview.destroy();
            this.hlsPreview = null;
        }
    };

    destroyHls = () => {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
    };

    changeDate = (d) => {
        this.setState({startDate: d, date: d.toLocaleDateString('sv')});
    };

    searchUnits = () => {
        const {date, content_type} = this.state;
        this.setState({loading: true, units: [], selected_unit: null, hls_url: null, clips: [], in_point: null});
        this.destroyHls();
        const path = `?page_size=100&start_date=${date}&end_date=${date}&content_type=${content_type}&order_by=id`;
        fetchUnits(path, (data) => {
            this.setState({units: data?.data || [], loading: false});
        });
    };

    selectUnit = (unit) => {
        this.setState({selected_unit: unit, hls_url: null, selected_file: null, mp4_file: null, clips: [], in_point: null, vod_uid: null, save_error: null});
        this.destroyHls();
        fetchUnits(`${unit.id}/files/`, (files) => {
            const pub = (files || []).filter(f => f.published && !f.removed_at && f.secure === 0);
            const isHls = f => f.properties?.video_size === 'HLS';
            const hls_file = pub.find(f => f.type === 'video' && isHls(f) && f.name?.startsWith('mlt_o_'))
                || pub.find(f => f.type === 'video' && isHls(f) && f.name?.includes('_o_'))
                || pub.find(f => f.type === 'video' && isHls(f));
            const mp4_file = pub.find(f => f.type === 'video' && !isHls(f) && f.mime_type === 'video/mp4' && f.name?.startsWith('mlt_o_'))
                || pub.find(f => f.type === 'video' && !isHls(f) && f.mime_type === 'video/mp4' && f.name?.includes('_o_'))
                || pub.find(f => f.type === 'video' && !isHls(f) && f.mime_type === 'video/mp4');
            if (hls_file) {
                const hls_url = `https://cdn.kab.info/${hls_file.uid}.m3u8`;
                this.setState({hls_url, selected_file: hls_file, mp4_file: mp4_file || null}, () => this.loadHls(hls_url));
            } else {
                this.setState({hls_url: null, selected_file: null, mp4_file: null});
            }
        });
    };

    loadHls = (url) => {
        const video = this.videoRef.current;
        if (!video) return;
        this.destroyHls();
        const token = getToken();
        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr) => {
                    if (token) xhr.setRequestHeader('Authorization', 'bearer ' + token);
                }
            });
            this.hls = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
            hls.on(Hls.Events.ERROR, (e, data) => console.log(':: HLS error:', data.type, data.details, data.response?.code));
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(() => {});
        }
    };

    getCurrentTime = () => {
        const v = this.videoRef.current;
        return v ? v.currentTime : 0;
    };

    setIn = () => {
        this.setState({in_point: this.getCurrentTime()});
    };

    setOut = () => {
        const {in_point, clips} = this.state;
        const out = this.getCurrentTime();
        if (in_point === null) return;
        this.setState({clips: [...clips, {in: in_point, out}], in_point: null});
    };

    removeClip = (i) => {
        const clips = [...this.state.clips];
        clips.splice(i, 1);
        this.setState({clips});
    };

    playClip = (clip, i) => {
        const {hls_url} = this.state;
        this.setState({preview_clip: i, preview_playing: false, preview_progress: 0});
        this.destroyHlsPreview();
        const video = this.previewRef.current;
        if (!video || !hls_url) return;
        const token = getToken();
        const hls = new Hls({
            startPosition: clip.in,
            xhrSetup: (xhr) => { if (token) xhr.setRequestHeader('Authorization', 'bearer ' + token); }
        });
        this.hlsPreview = hls;
        hls.loadSource(hls_url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.currentTime = clip.in;
            video.play().catch(() => {});
            this.setState({preview_playing: true});
        });
        video.ontimeupdate = () => {
            const progress = Math.min((video.currentTime - clip.in) / (clip.out - clip.in), 1);
            this.setState({preview_progress: progress});
            if (video.currentTime >= clip.out) {
                video.pause();
                this.setState({preview_playing: false, preview_progress: 1});
            }
        };
    };

    previewSeek = (e) => {
        const {clips, preview_clip} = this.state;
        if (preview_clip === null) return;
        const clip = clips[preview_clip];
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const video = this.previewRef.current;
        if (video) video.currentTime = clip.in + ratio * (clip.out - clip.in);
        this.setState({preview_progress: ratio});
    };

    previewTogglePlay = () => {
        const video = this.previewRef.current;
        if (!video) return;
        if (video.paused) { video.play(); this.setState({preview_playing: true}); }
        else { video.pause(); this.setState({preview_playing: false}); }
    };

    jumpTo = (t) => {
        const v = this.videoRef.current;
        if (v) v.currentTime = t;
    };

    getMp4Path = () => {
        const {selected_file} = this.state;
        if (!selected_file) return null;
        // HLS url format: https://files.kab.sh/hls/YYYY/MM/DD/filename.mp4,.urlset/master.m3u8
        // "hls/" on files.kab.sh = "kmedia/" on wfsrv
        const url = selected_file.properties?.url || '';
        const match = url.match(/files\.kab\.sh\/hls\/(.+?)(?:,\.urlset|$)/);
        if (match) return `/wfapi/backup/files/kmedia/${match[1]}`;
        return null;
    };

    buildVodJson = () => {
        const {clips} = this.state;
        const path = this.getMp4Path();
        return {
            durations: clips.map(c => Math.round((c.out - c.in) * 1000)),
            sequences: [{
                clips: clips.map(c => ({
                    type: 'source',
                    path,
                    clipFrom: Math.round(c.in * 1000),
                }))
            }]
        };
    };

    saveClips = async () => {
        const {selected_unit, mp4_file} = this.state;
        this.setState({saving: true, save_error: null, vod_uid: null});
        const json = this.buildVodJson();
        console.log(':: mp4_file full:', JSON.stringify(mp4_file, null, 2));
        console.log(':: VOD path:', this.getMp4Path());
        const uid = selected_unit.uid;
        try {
            const r = await fetch(`/vod-proxy/api/vod-maps/${uid}.json`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(json),
            });
            if (r.ok) {
                this.setState({saving: false, vod_uid: uid});
            } else {
                this.setState({saving: false, save_error: `Server error: ${r.status}`});
            }
        } catch (e) {
            this.setState({saving: false, save_error: e.message});
        }
    };

    render() {
        const {startDate, date, content_type, units, loading, selected_unit, selected_file, hls_url, clips, in_point, preview_clip, preview_playing, preview_progress, saving, vod_uid, save_error} = this.state;

        return (
            <Grid padded>
                <Grid.Row>
                    <Grid.Column width={5}>
                        <Segment raised>
                            <Header as='h4'>Search MDB Units</Header>
                            <div style={{marginBottom: '0.5em'}}>
                                <DatePicker
                                    locale={he}
                                    selected={startDate}
                                    onChange={this.changeDate}
                                    dateFormat="yyyy-MM-dd"
                                />
                            </div>
                            <Dropdown
                                selection fluid
                                options={CONTENT_TYPES}
                                value={content_type}
                                onChange={(e, {value}) => this.setState({content_type: value})}
                                style={{marginBottom: '0.5em'}}
                            />
                            <Button primary fluid loading={loading} onClick={this.searchUnits}>
                                <Icon name='search' /> Search
                            </Button>
                        </Segment>

                        <Segment raised style={{maxHeight: '60vh', overflowY: 'auto'}}>
                            {units.length === 0 && !loading && (
                                <p style={{color: '#999'}}>No units found</p>
                            )}
                            <List selection divided>
                                {units.map(u => (
                                    <List.Item
                                        key={u.id}
                                        active={selected_unit?.id === u.id}
                                        onClick={() => this.selectUnit(u)}
                                    >
                                        <List.Content>
                                            <List.Header style={{fontSize: '0.85em'}}>
                                                {u.uid}
                                            </List.Header>
                                            <List.Description style={{fontSize: '0.75em', color: '#555'}}>
                                                {u.content_type}
                                                {u.properties?.part !== undefined ? ` · Part ${u.properties.part}` : ''}
                                                {u.properties?.duration ? ` · ${toHms(u.properties.duration)}` : ''}
                                            </List.Description>
                                        </List.Content>
                                    </List.Item>
                                ))}
                            </List>
                        </Segment>
                    </Grid.Column>

                    <Grid.Column width={11}>
                        {hls_url ? (
                            <>
                                <Segment raised>
                                    <video
                                        ref={this.videoRef}
                                        controls
                                        style={{width: '100%', maxHeight: '420px', background: '#000'}}
                                    />
                                    <div style={{marginTop: '0.5em', display: 'flex', gap: '0.5em', flexWrap: 'wrap', alignItems: 'center'}}>
                                        <Button
                                            color='green'
                                            onClick={this.setIn}
                                        >
                                            Set IN {in_point !== null ? `(${toHms(in_point)})` : ''}
                                        </Button>
                                        <Button
                                            color='red'
                                            disabled={in_point === null}
                                            onClick={this.setOut}
                                        >
                                            Set OUT
                                        </Button>
                                    </div>
                                </Segment>

                                {preview_clip !== null && clips[preview_clip] && (() => {
                                    const clip = clips[preview_clip];
                                    const dur = clip.out - clip.in;
                                    const elapsed = preview_progress * dur;
                                    return (
                                        <Segment raised>
                                            <Header as='h5' style={{marginBottom: '0.3em'}}>
                                                Preview — Clip {preview_clip + 1} &nbsp;
                                                <span style={{fontWeight: 'normal', color: '#555'}}>
                                                    {toHms(clip.in)} → {toHms(clip.out)} · {toHms(dur)}
                                                </span>
                                            </Header>
                                            <video ref={this.previewRef} style={{width: '100%', background: '#000', display: 'block'}} />
                                            <div style={{marginTop: '0.4em', display: 'flex', alignItems: 'center', gap: '0.6em'}}>
                                                <Icon
                                                    name={preview_playing ? 'pause' : 'play'}
                                                    size='large'
                                                    style={{cursor: 'pointer', margin: 0}}
                                                    onClick={this.previewTogglePlay}
                                                />
                                                <div
                                                    onClick={this.previewSeek}
                                                    style={{flex: 1, height: '6px', background: '#ddd', borderRadius: '3px', cursor: 'pointer', position: 'relative'}}
                                                >
                                                    <div style={{
                                                        width: `${preview_progress * 100}%`,
                                                        height: '100%',
                                                        background: '#2185d0',
                                                        borderRadius: '3px',
                                                        pointerEvents: 'none'
                                                    }} />
                                                </div>
                                                <span style={{fontSize: '0.85em', whiteSpace: 'nowrap', color: '#555'}}>
                                                    {toHms(elapsed)} / {toHms(dur)}
                                                </span>
                                            </div>
                                        </Segment>
                                    );
                                })()}

                                {clips.length > 0 && (
                                    <Segment raised>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em'}}>
                                            <Header as='h5' style={{margin: 0}}>Clips ({clips.length})</Header>
                                            <Button
                                                primary
                                                size='small'
                                                loading={saving}
                                                disabled={saving || !selected_file}
                                                onClick={this.saveClips}
                                            >
                                                <Icon name='save' /> Save to VOD Server
                                            </Button>
                                        </div>
                                        {!this.getMp4Path() && (
                                            <Message warning size='small'>Cannot resolve source MP4 path for this unit.</Message>
                                        )}
                                        {save_error && (
                                            <Message negative size='small'>{save_error}</Message>
                                        )}
                                        {vod_uid && (
                                            <Message positive size='small'>
                                                <Message.Header>Saved!</Message.Header>
                                                <p style={{wordBreak: 'break-all'}}>HLS: <code>http://10.66.1.76:8080/hls/{vod_uid}.json/master.m3u8</code></p>
                                            </Message>
                                        )}
                                        <Table compact size='small'>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>#</Table.HeaderCell>
                                                    <Table.HeaderCell>In</Table.HeaderCell>
                                                    <Table.HeaderCell>Out</Table.HeaderCell>
                                                    <Table.HeaderCell>Duration</Table.HeaderCell>
                                                    <Table.HeaderCell></Table.HeaderCell>
                                                    <Table.HeaderCell></Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {clips.map((c, i) => (
                                                    <Table.Row key={i}>
                                                        <Table.Cell>{i + 1}</Table.Cell>
                                                        <Table.Cell>
                                                            <a onClick={() => this.jumpTo(c.in)} style={{cursor: 'pointer', color: 'green'}}>
                                                                {toHms(c.in)}
                                                            </a>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <a onClick={() => this.jumpTo(c.out)} style={{cursor: 'pointer', color: 'red'}}>
                                                                {toHms(c.out)}
                                                            </a>
                                                        </Table.Cell>
                                                        <Table.Cell>{toHms(c.out - c.in)}</Table.Cell>
                                                        <Table.Cell>
                                                            <Icon name='play' color='blue' style={{cursor: 'pointer'}} onClick={() => this.playClip(c, i)} />
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Icon name='trash' color='red' style={{cursor: 'pointer'}} onClick={() => this.removeClip(i)} />
                                                        </Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </Segment>
                                )}
                            </>
                        ) : selected_unit ? (
                            <Segment raised placeholder>
                                <Header icon>
                                    <Icon name='film' />
                                    No video file found for this unit
                                </Header>
                            </Segment>
                        ) : (
                            <Segment raised placeholder>
                                <Header icon>
                                    <Icon name='film' />
                                    Select a unit to play
                                </Header>
                            </Segment>
                        )}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

export default ClipsApp;
