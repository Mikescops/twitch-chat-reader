import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as tmi from 'tmi.js';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { messagesRender } from './messages';
import { useDebounce } from './utils';

interface Message {
    message: string;
    author: string;
    color: string;
    emotes?: { [emoteid: string]: string[] };
    type: 'chat' | 'mod' | 'raid' | 'system';
}

export const App = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [savedMessages, setSavedMessages] = useState<Message[]>([]);

    const [channel, setChannel] = useState('mikescops');
    const debouncedChannel = useDebounce(channel, 1000);

    const handleChange = (event: React.ChangeEvent<any>) => {
        setChannel(event.target.value);
    };

    const onDiv = useRef(false);

    const messageEl = useRef<any | null>(null);
    const client = useRef<tmi.Client | null>(null);

    useEffect(() => {
        setMessages([
            { message: `Welcome to ${debouncedChannel}'s chat!`, author: 'system', color: '#000', type: 'system' }
        ]);

        setSavedMessages([{ message: 'Welcome to saved chat!', author: 'system', color: '#000', type: 'system' }]);

        client.current = new tmi.Client({
            connection: { reconnect: true },
            channels: [debouncedChannel]
        });

        client.current.connect();

        client.current.on('message', (_channel, tags, message, self) => {
            if (self) {
                return;
            }

            if (tags['message-type'] === 'chat') {
                pushMessage({
                    message,
                    author: tags['display-name'] || 'unknown',
                    color: tags.color || '#000',
                    emotes: tags.emotes,
                    type: 'chat'
                });
            }

            return;
        });

        client.current.on('raided', (_channel, username, viewers) => {
            pushMessage({
                message: `${username} is raiding you channel with ${viewers} viewers.`,
                author: 'system',
                color: '#000',
                type: 'raid'
            });
        });

        client.current.on('slowmode', (_channel, enabled, length) => {
            pushMessage({
                message: `Slow Mode ${enabled ? 'enabled (every ' + length + 's)' : 'disabled'}.`,
                author: 'system',
                color: '#000',
                type: 'mod'
            });
        });

        client.current.on('followersonly', (channel, enabled, length) => {
            pushMessage({
                message: `Followers only Mode ${enabled ? 'enabled (since ' + length + 's)' : 'disabled'}.`,
                author: 'system',
                color: '#000',
                type: 'mod'
            });
        });

        client.current.on('subscribers', (_channel, enabled) => {
            pushMessage({
                message: `Subscriber Mode ${enabled ? 'enabled' : 'disabled'}.`,
                author: 'system',
                color: '#000',
                type: 'mod'
            });
        });

        client.current.on('emoteonly', (_channel, enabled) => {
            pushMessage({
                message: `Emote only Mode ${enabled ? 'enabled' : 'disabled'}.`,
                author: 'system',
                color: '#000',
                type: 'mod'
            });
        });

        return () => {
            client.current?.disconnect();
        };
    }, [debouncedChannel]);

    useEffect(() => {
        if (messageEl) {
            messageEl.current.addEventListener('DOMNodeInserted', (event: any) => {
                if (onDiv.current) {
                    return;
                }
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
            });

            messageEl.current.addEventListener('mouseenter', () => {
                onDiv.current = true;
            });
            messageEl.current.addEventListener('mouseleave', () => {
                onDiv.current = false;
            });
        }
    }, []);

    const pushMessage = (message: Message) => {
        setMessages((prev) => {
            return [...(prev.length > 100 && !onDiv.current ? prev.slice(1, 101) : prev), message];
        });
    };

    const addToSavedMessage = useCallback(
        (message) => () => {
            console.log(message);
            setSavedMessages((prev) => [...prev, message]);
        },
        []
    );

    const removeFromSavedMessage = useCallback(
        (message) => () => {
            console.log(message);
            setSavedMessages((prev) => prev.filter((msg) => msg !== message));
        },
        []
    );

    return (
        <Container>
            <Row>
                <Form.Control type="text" placeholder="channel" defaultValue={channel} onChange={handleChange} />
            </Row>
            <Row>
                <Col>
                    <h2>Chat</h2>
                    <ul ref={messageEl} className={'messages'}>
                        {messages.map((message, index) => (
                            <li key={index} onClick={addToSavedMessage(message)} className={'message-item'}>
                                <strong style={{ color: message.color }}>{message.author}</strong>:{' '}
                                {messagesRender(message.message, message.emotes)}
                            </li>
                        ))}
                    </ul>
                </Col>
                <Col>
                    <h2>Saved messages</h2>
                    <ul className={'messages'}>
                        {savedMessages.map((message, index) => (
                            <li key={index} onClick={removeFromSavedMessage(message)} className={'message-item'}>
                                <strong style={{ color: message.color }}>{message.author}</strong>:{' '}
                                {messagesRender(message.message, message.emotes)}
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row>
        </Container>
    );
};
