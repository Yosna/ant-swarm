import time from './time.js';

const logger = (...content) => log.append(content);

const log = {
    get timestamp() {
        const timestamp = document.createElement('span');
        timestamp.classList.add('message-timestamp');
        timestamp.textContent = time.timestamp;
        return timestamp;
    },

    entry: () => {
        const wrapper = document.createElement('div');
        const parent = document.createElement('pre');
        return { parent, wrapper };
    },

    message: (content) => {
        const message = document.createElement('span');
        message.classList.add('message-text');
        message.textContent = `${content.join('')}`;
        return message;
    },

    create: function(content) {
        const entry = this.entry();
        entry.wrapper.append(this.timestamp, this.message(content));
        entry.parent.appendChild(entry.wrapper);
        return entry.parent;
    },

    append: function(content) {
        const entries = document.querySelector('.message-log');
        const entry = this.create(content);

        entries.insertBefore(entry, entries.firstChild);

        if (entries.childElementCount > 100) {
            entries.removeChild(entries.lastChild);
        }
        return this;
    }
};

export default logger;
