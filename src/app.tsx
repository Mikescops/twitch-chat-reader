import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as tmi from 'tmi.js';
import { Container, Row, Col } from 'react-bootstrap';
import { messagesRender } from './messages';

interface Message {
    message: string;
    author: string;
    color: string;
    emotes?: { [emoteid: string]: string[] };
}

export const App = () => {
    const [messages, setMessages] = useState<Message[]>([
        { message: 'Welcome to chat!', author: 'system', color: '#000' }
    ]);
    const [savedMessages, setSavedMessages] = useState<Message[]>([
        { message: 'Welcome to saved chat!', author: 'system', color: '#000' }
    ]);

    const onDiv = useRef(false);

    const messageEl = useRef<any | null>(null);
    const client = useRef<tmi.Client | null>(null);

    useEffect(() => {
        console.log('item');
        client.current = new tmi.Client({
            connection: { reconnect: true },
            channels: ['ponce']
        });

        client.current.connect();

        client.current.on('message', (_channel, tags, message) => {
            // const preparedMessage = `${tags['display-name']}: ${message}`;
            // console.log(preparedMessage, tags);

            console.log(tags);
            setMessages((prev) => [
                ...prev,
                {
                    message,
                    author: tags['display-name'] || 'unknown',
                    color: tags.color || '#000',
                    emotes: tags.emotes
                }
            ]);
        });
    }, []);

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
