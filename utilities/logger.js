const logger = (...args) => addLogger(createLogger(...args));

const createLogger = (...args) => {
    const d = new Date();
    const time = document.createElement('span');
    const text = document.createElement('span');
    time.classList.add('message-time');
    text.classList.add('message-text');
    time.textContent = `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]:`;
    text.textContent = `${Array.from(...args).join('')}`;
    const format = [time, text];
    const message = document.createElement('div');
    const log = document.createElement('pre');
    message.append(...format);
    log.appendChild(message);
    return log;
};

const addLogger = (log) => {
    const element = document.querySelector('.message-log');
    element.insertBefore(log, element.firstChild);
    if (element.childElementCount > 50) {
        element.removeChild(element.lastChild);
    }
};

export default logger;
