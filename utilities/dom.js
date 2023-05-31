import logger from './logger.js';

function getElement(selector) {
    return document.querySelector(selector);
}

function getElements(selector) {
    return document.querySelectorAll(selector);
}

function updateElement(element) {
    const { selector, property, value } = element;
    if (getElement(selector)) {
        editProperty(selector, property, value);
    }
}

function updateElements(elements) {
    for (const element of Object.values(elements)) {
        const { selector, property, value } = element;
        if (getElement(selector)) {
            editProperty(selector, property, value);
        }
    }
}

function editProperty(selector, property, value) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        const keys = property.split('.');
        const propertyIndex = keys.length - 1;
        let target = element;
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        target[keys[propertyIndex]] = value;
    }
}

function toggleModal(target, callback) {
    const modal = getElement(`#${target.dataset.modal}`);
    if (callback) callback();
    modal.classList.toggle('collapse');
}

function toggleSetting(condition) {
    const setting = getElement(`#${condition.id}-button`);
    const settingStatus = getElement(`#${condition.id}-status`);

    condition.status = !condition.status;
    const [status, message] = condition.status
        ? ['on', `${condition.name}: enabled`]
        : ['off', `${condition.name}: disabled`];

    if (condition.status !== setting.classList.contains('highlight')) {
        setting.classList.toggle('highlight');
    }
    settingStatus.innerHTML = status;
    logger(message);
}

function eventListener(selector, event, callback) {
    if (selector) {
        const selected = document.querySelectorAll(selector);
        for (const key of selected) {
            key.addEventListener(event, callback);
        }
    } else {
        document.addEventListener(event, callback);
    }
}

export default {
    getElement,
    getElements,
    updateElement,
    updateElements,
    editProperty,
    toggleModal,
    toggleSetting,
    eventListener
};
