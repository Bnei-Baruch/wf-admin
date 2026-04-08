import React, {Component, createRef} from 'react';
import {Button, Checkbox, Form, Grid, Header, Icon, Input, Label, Segment, Table} from 'semantic-ui-react';
import Hls from 'hls.js';
import {fetchUnits, getToken} from '../../shared/tools';

function parseOutput(text) {
    const blocks = [];
    let current = null;
    for (const raw of text.split('\n')) {
        const line = raw.trim();
        const fileMatch = line.match(/^FILE:\s+(.+\.mp4)$/);
        // PART n uid in1 out1 [in2 out2 ...]
        const partMatch = line.match(/^PART\s+(\d+)\s+(\S+)\s+([\d.\s]+)$/);
        if (fileMatch) {
            current = {file: fileMatch[1], parts: []};
            blocks.push(current);
        } else if (partMatch && current) {
            const nums = partMatch[3].trim().split(/\s+/).map(Number);
            const segments = [];
            for (let i = 0; i + 1 < nums.length; i += 2) {
                segments.push({inSec: nums[i], outSec: nums[i + 1]});
            }
            current.parts.push({
                part: parseInt(partMatch[1]),
                uid: partMatch[2],
                segments,
                inSec: segments[0]?.inSec || 0,
                outSec: segments[segments.length - 1]?.outSec || 0,
            });
        }
    }
    return blocks.filter(b => b.parts.length > 0);
}

class PartRow extends Component {
    state = {hlsUrl: null, mp4Url: null, vodUrl: null, error: null};
    leftRef = createRef();
    rightRef = createRef();
    hlsLeft = null;
    hlsRight = null;

    componentDidMount() {
        this.createVodMap();
        this.lookupFile();
    }

    componentWillUnmount() {
        if (this.hlsLeft) { this.hlsLeft.destroy(); this.hlsLeft = null; }
        if (this.hlsRight) { this.hlsRight.destroy(); this.hlsRight = null; }
        const {uid, vodHost, mapPort} = this.props;
        fetch(`http://${vodHost}:${mapPort}/map?uid=${uid}`, {method: 'DELETE'}).catch(() => {});
    }

    createVodMap = () => {
        const {uid, segments, inSec, outSec, file, year, vodBase, vodHost, mapPort} = this.props;
        const path = `/Volumes/buffer/original/ShiurBoker/${year}/${file}`;
        const segs = (segments || [{inSec, outSec}]).map(s => ({
            start: s.inSec,
            duration: s.outSec - s.inSec,
        }));

        fetch(`http://${vodHost}:${mapPort}/map`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({uid, path, segments: segs}),
        })
            .then(r => r.json())
            .then(() => {
                const vodUrl = `${vodBase}/hls/${uid}.json/master.m3u8`;
                this.setState({vodUrl}, () => this.loadLeftHls(vodUrl));
            })
            .catch(e => this.setState({error: `Map error: ${e.message}`}));
    };

    loadLeftHls = (url) => {
        const video = this.leftRef.current;
        if (!video) return;
        if (this.hlsLeft) { this.hlsLeft.destroy(); this.hlsLeft = null; }
        if (Hls.isSupported()) {
            const hls = new Hls();
            this.hlsLeft = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (e, d) => {
                if (d.fatal) this.setState({error: `VOD: ${d.details}`});
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        }
    };

    lookupFile = () => {
        const {uid} = this.props;
        fetchUnits(`?uid=${uid}`, (data) => {
            const unit = data?.data?.[0];
            if (!unit) return;
            fetchUnits(`${unit.id}/files/`, (files) => {
                const pub = (files || []).filter(f => f.published && !f.removed_at && f.secure === 0);
                const isHls = f => f.properties?.video_size === 'HLS';
                const hls_file = pub.find(f => f.type === 'video' && isHls(f) && f.name?.startsWith('mlt_o_'))
                    || pub.find(f => f.type === 'video' && isHls(f));
                if (hls_file) {
                    const hlsUrl = `https://cdn.kab.info/${hls_file.uid}.m3u8`;
                    this.setState({hlsUrl}, () => this.loadRightHls(hlsUrl));
                    return;
                }
                const mp4_file = pub.find(f => f.type === 'video' && f.mime_type === 'video/mp4' && f.name?.startsWith('heb_o_rav'))
                    || pub.find(f => f.type === 'video' && f.mime_type === 'video/mp4' && f.language === 'he' && f.name?.includes('_o_'))
                    || pub.find(f => f.type === 'video' && f.mime_type === 'video/mp4' && f.name?.includes('_o_'));
                this.setState({mp4Url: mp4_file?.properties?.url || null});
            });
        });
    };

    loadRightHls = (url) => {
        const video = this.rightRef.current;
        if (!video) return;
        if (this.hlsRight) { this.hlsRight.destroy(); this.hlsRight = null; }
        const token = getToken();
        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr) => { if (token) xhr.setRequestHeader('Authorization', 'bearer ' + token); }
            });
            this.hlsRight = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        }
    };

    render() {
        const {uid, inSec, outSec, segments, part, onInChange, onOutChange} = this.props;
        const {hlsUrl, mp4Url, vodUrl, error} = this.state;

        const fmt = s => {
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = (s % 60).toFixed(3);
            return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${sec}` : `${m}:${sec}`;
        };

        const rightLabel = hlsUrl ? 'Kabmedia HLS' : mp4Url ? 'Kabmedia MP4' : 'Kabmedia';
        const rightLink = hlsUrl || mp4Url;
        const segs = segments || [{inSec, outSec}];

        return (
            <Segment>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap'}}>
                    <Label color='blue'>PART {part}</Label>
                    <span style={{fontFamily: 'monospace', fontSize: '0.9em'}}>{uid}</span>
                    {segs.length > 1
                        ? segs.map((s, i) => (
                            <Label key={i} basic size='small'>{fmt(s.inSec)} – {fmt(s.outSec)}</Label>
                        ))
                        : <>
                            <Input size='mini' label='in' value={inSec}
                                onChange={e => onInChange(parseFloat(e.target.value) || 0)} style={{width: 120}} />
                            <Input size='mini' label='out' value={outSec}
                                onChange={e => onOutChange(parseFloat(e.target.value) || 0)} style={{width: 120}} />
                            <Label basic>{fmt(inSec)} – {fmt(outSec)}</Label>
                        </>
                    }
                    <Button size='mini' icon='step forward' content='Last 5s' onClick={() => {
                        [this.leftRef, this.rightRef].forEach(ref => {
                            const v = ref.current;
                            if (v && v.duration && isFinite(v.duration)) {
                                v.currentTime = Math.max(0, v.duration - 5);
                                v.play().catch(() => {});
                            }
                        });
                    }} />
                    {error && <Label color='red'>{error}</Label>}
                    {!vodUrl && !error && <Label color='grey'>Creating VOD map...</Label>}
                </div>
                <Grid columns={2} divided>
                    <Grid.Column>
                        <div style={{marginBottom: 4, fontSize: '0.8em', color: '#666'}}>
                            Local (nginx-vod){' '}
                            {vodUrl && <a href={vodUrl} target="_blank" rel="noreferrer"><Icon name='external' /></a>}
                        </div>
                        <video ref={this.leftRef} controls preload="none"
                            style={{width: '100%', background: '#000'}}
                            onPlay={e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause())}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <div style={{marginBottom: 4, fontSize: '0.8em', color: '#666'}}>
                            {rightLabel}{' '}
                            {rightLink && <a href={rightLink} target="_blank" rel="noreferrer"><Icon name='external' /></a>}
                        </div>
                        {mp4Url && !hlsUrl ? (
                            <video ref={this.rightRef} src={mp4Url} controls preload="metadata"
                                style={{width: '100%', background: '#000'}}
                                onPlay={e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause())}
                            />
                        ) : (
                            <video ref={this.rightRef} controls preload="none"
                                style={{width: '100%', background: '#000'}}
                                onPlay={e => document.querySelectorAll('video').forEach(v => v !== e.target && v.pause())}
                            />
                        )}
                    </Grid.Column>
                </Grid>
            </Segment>
        );
    }
}

class VerifyApp extends Component {
    state = {
        mapPort: '8001',
        vodHost: '10.66.1.119',
        year: '2018',
        records: [],     // [{file, parts: [{part,uid,inSec,outSec}], checked, expanded}]
        loadKey: 0,
    };

    handleExport = () => {
        const {records} = this.state;
        const lines = [];
        records.forEach(rec => {
            lines.push(`FILE: ${rec.file}`);
            rec.parts.forEach(p => {
                const segs = (p.segments || [{inSec: p.inSec, outSec: p.outSec}])
                    .map(s => `${s.inSec.toFixed(3)} ${s.outSec.toFixed(3)}`).join(' ');
                lines.push(`PART ${p.part} ${p.uid} ${segs}`);
            });
        });
        const blob = new Blob([lines.join('\n')], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'hls-trim-points.txt';
        a.click();
    };

    handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const blocks = parseOutput(ev.target.result);
            const records = blocks.map(b => ({...b, checked: false, expanded: false}));
            this.setState(prev => ({records, loadKey: prev.loadKey + 1}));
        };
        reader.readAsText(file);
    };

    toggleExpand = (i) => {
        this.setState(prev => {
            const records = [...prev.records];
            records[i] = {...records[i], expanded: !records[i].expanded};
            return {records};
        });
    };

    toggleChecked = (i) => {
        this.setState(prev => {
            const records = [...prev.records];
            records[i] = {...records[i], checked: !records[i].checked};
            return {records};
        });
    };

    updatePart = (ri, pi, field, value) => {
        this.setState(prev => {
            const records = [...prev.records];
            const parts = [...records[ri].parts];
            parts[pi] = {...parts[pi], [field]: value};
            records[ri] = {...records[ri], parts};
            return {records};
        });
    };

    render() {
        const {mapPort, vodHost, year, records, loadKey} = this.state;
        const vodBase = `http://${vodHost}:8080`;
        const checked = records.filter(r => r.checked).length;

        return (
            <div style={{padding: 16}}>
                <Header as='h2'><Icon name='check circle outline' />Verify Trim Points</Header>
                <Segment>
                    <Form>
                        <Form.Group inline>
                            <Form.Field>
                                <label>Map server port</label>
                                <Input value={mapPort} onChange={e => this.setState({mapPort: e.target.value})} style={{width: 80}} />
                            </Form.Field>
                            <Form.Field>
                                <label>VOD host</label>
                                <Input value={vodHost} onChange={e => this.setState({vodHost: e.target.value})} style={{width: 130}} />
                            </Form.Field>
                            <Form.Field>
                                <label>Year</label>
                                <Input value={year} onChange={e => this.setState({year: e.target.value})} style={{width: 80}} />
                            </Form.Field>
                            <Form.Field>
                                <label>Upload script output</label>
                                <input type="file" accept=".txt,.log" onChange={this.handleFile} />
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Segment>

                {records.length > 0 && (
                    <div style={{marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8}}>
                        <Label>{records.length} files</Label>
                        <Label color='green'>{checked} checked</Label>
                        <Label color='grey'>{records.length - checked} remaining</Label>
                        <Button size='mini' icon='download' content='Export txt' onClick={this.handleExport} />
                    </div>
                )}

                {records.length > 0 && (
                    <Table compact celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={1}>Done</Table.HeaderCell>
                                <Table.HeaderCell>File</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Parts</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {records.map((rec, i) => (
                                <React.Fragment key={`${loadKey}-${i}`}>
                                    <Table.Row positive={rec.checked}>
                                        <Table.Cell textAlign='center'>
                                            <Checkbox checked={rec.checked} onChange={() => this.toggleChecked(i)} />
                                        </Table.Cell>
                                        <Table.Cell style={{fontFamily: 'monospace', fontSize: '0.85em'}}>
                                            {rec.checked && <Icon name='check circle' color='green' />}
                                            {rec.file}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {rec.parts.map(p => (
                                                <Label key={p.uid} size='mini' style={{marginBottom: 2}}>
                                                    P{p.part} <span style={{fontFamily: 'monospace'}}>{p.uid}</span>
                                                </Label>
                                            ))}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button size='mini' primary={rec.expanded} onClick={() => this.toggleExpand(i)}>
                                                <Icon name={rec.expanded ? 'compress' : 'play'} />
                                                {rec.expanded ? 'Collapse' : 'View'}
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                    {rec.expanded && (
                                        <Table.Row>
                                            <Table.Cell colSpan={4} style={{padding: 0, background: '#f9f9f9'}}>
                                                {rec.parts.map((p, pi) => (
                                                    <PartRow
                                                        key={`${loadKey}-${i}-${pi}-${p.uid}`}
                                                        file={rec.file}
                                                        mapPort={mapPort}
                                                        vodBase={vodBase}
                                                        vodHost={vodHost}
                                                        year={year}
                                                        onInChange={v => this.updatePart(i, pi, 'inSec', v)}
                                                        onOutChange={v => this.updatePart(i, pi, 'outSec', v)}
                                                        {...p}
                                                    />
                                                ))}
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </React.Fragment>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </div>
        );
    }
}

export default VerifyApp;
