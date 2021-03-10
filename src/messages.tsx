import React from 'react';

export const messagesRender = (message: string, emotes?: { [emoteid: string]: string[] }): JSX.Element[] | string => {
    if (!emotes) {
        return message;
    }

    interface ParsedEmote {
        end: number;
        emoteElement: JSX.Element;
    }

    const sortedEmotes = Object.entries(emotes).reduce((acc: { [position: string]: ParsedEmote }, [key, arr]) => {
        arr.forEach((position) => {
            const [start, end] = position.split('-');
            const parsedEnd = parseInt(end, 10);
            acc[start] = {
                end: parsedEnd,
                emoteElement: <img src={`https://static-cdn.jtvnw.net/emoticons/v1/${key}/1.0`} />
            };
        });

        return acc;
    }, {});

    let lastIndex = 0;

    const content: JSX.Element[] = [];

    Object.entries(sortedEmotes).forEach(([start, parsedEmote]) => {
        content.push(<>{message.substring(lastIndex, parseInt(start, 10))}</>);

        content.push(parsedEmote.emoteElement);

        lastIndex = parsedEmote.end + 1;
    });

    content.push(<>{message.substring(lastIndex, message.length + 1)}</>);

    return content;
};
