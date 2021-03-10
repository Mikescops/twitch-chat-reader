import React from 'react';

export const messagesRender = (message: string, emotes?: { [emoteid: string]: string[] }): JSX.Element[] | string => {
    if (!emotes) {
        return message;
    }

    const content: JSX.Element[] = [];
    let lastIndex = 0;

    Object.entries(emotes).forEach(([id, positions]) => {
        positions.forEach((position) => {
            const [start, end] = position.split('-');

            content.push(<>{message.substring(lastIndex, parseInt(start, 10))}</>);

            content.push(<img src={`https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`} />);

            lastIndex = parseInt(end, 10) + 1;
        });
    });

    content.push(<>{message.substring(lastIndex, message.length + 1)}</>);

    return content;
};
