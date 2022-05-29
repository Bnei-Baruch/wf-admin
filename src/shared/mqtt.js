import mqtt from 'mqtt';
import {MQTT_LCL_URL, MQTT_EXT_URL, randomString} from "./tools";

class MqttMsg {

    constructor() {
        this.user = null;
        this.mq = null;
        this.connected = false;
        this.token = null;
    }

    init = (user, callback) => {

        if(this.connected) {
            callback(true);
        }

        this.user = user;

        const transformUrl = (url, options, client) => {
            client.options.password = this.token;
            return url;
        };

        let options = {
            keepalive: 10,
            connectTimeout: 10 * 1000,
            clientId: user.sub + "-" + randomString(5)  ,
            protocolId: 'MQTT',
            protocolVersion: 5,
            clean: true,
            username: user.email,
            password: this.token,
            transformWsUrl: transformUrl,
            properties: {
                sessionExpiryInterval: 5,
                maximumPacketSize: 256000,
                requestResponseInformation: true,
                requestProblemInformation: true,
            },
        };

        // const local = true;
        // const url = local ? MQTT_LCL_URL : MQTT_EXT_URL;
        const url = MQTT_LCL_URL

        this.mq = mqtt.connect(`wss://${url}`, options);

        this.mq.on('connect', (data) => {
            if(data && !this.connected) {
                console.log("[mqtt] Connected to server: ", data, this.mq);
                this.connected = true;
                callback(data)
            }
        });

        this.mq.on('error', (data) => console.error('[mqtt] Error: ', data));
        this.mq.on('disconnect', (data) => console.error('[mqtt] Error: ', data));
    }

    join = (topic) => {
        console.debug("[mqtt] Subscribe to: ", topic)
        let options = {qos: 1, nl: false}
        this.mq.subscribe(topic, {...options}, (err) => {
            err && console.error('[mqtt] Error: ', err);
        })
    }

    exit = (topic) => {
        let options = {}
        console.debug("[mqtt] Unsubscribe from: ", topic);
        this.mq.removeAllListeners('message');
        this.mq.unsubscribe(topic, {...options} ,(err) => {
            err && console.error('[mqtt] Error: ',err);
        })
    }

    send = (message, retain, topic) => {
        if(message !== "status")
            console.debug("[mqtt] Send data on topic: ", topic, message)
        let options = {qos: 2, retain};
        this.mq.publish(topic, message, {...options}, (err) => {
            err && console.error('[mqtt] Error: ',err);
        })
    }

    watch = (callback, local) => {
        //let i = local ? 0 : 1;
        let i = 0
        this.mq.on('message',  (topic, data, packet) => {
            const type = topic.split("/")[2+i]
            const source = topic.split("/")[3+i]
            const message = JSON.parse(data.toString());
            //console.debug("[mqtt] message: ", message, ", on topic: ", topic, ", source: ", source);
            callback(message, type, source)
        })
    }

    setToken = (token) => {
        this.token = token;
    }

}

const defaultMqtt = new MqttMsg();

export default defaultMqtt;



