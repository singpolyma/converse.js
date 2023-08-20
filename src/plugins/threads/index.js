import { _converse, api, converse } from '@converse/headless/core.js';
import { html } from 'lit';
import { arrayBufferToHex, stringToArrayBuffer } from 'headless/utils/arraybuffer';
import Identicon from 'identicon.js';

const u = converse.env.utils;

converse.plugins.add('converse-threads', {
    dependencies: ['converse-chatview'],
    initialize () {
        api.listen.on('getToolbarButtons', getToolbarButton);

        api.listen.on('chatBoxViewInitialized', onChatInitialized);
        api.listen.on('chatRoomViewInitialized', onChatInitialized);
    }
});

function onChatInitialized(el) {
    el.listenTo(el.model, 'change:thread', () => {
        el.querySelector('converse-chat-toolbar').requestUpdate();
    });
}

export function getToolbarButton (toolbar_el, buttons) {
    const model = toolbar_el.model;
    const threadClick = async () => {
        const thread = u.getUniqueId();
        model.save({
          'thread': thread,
          'thread_sha1': await crypto.subtle.digest('SHA-1', stringToArrayBuffer(thread))
        });
    };
    const threadHash = model.get('thread_sha1') ? arrayBufferToHex(model.get('thread_sha1')) : 'aaaaaaaaaaaaaaa';
    const thread_identicon = threadHash ? new DOMParser().parseFromString(new Identicon(threadHash, { background: [0,0,0,0], format: 'svg', size: 16 }).render().getDump(), 'image/svg+xml').documentElement : null;
    buttons.push(html`
        <button @click=${threadClick}>${thread_identicon}</button>
    `);
    return buttons;
}
