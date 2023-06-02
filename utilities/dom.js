import logger from './logger.js';

const getElement = (selector) => document.querySelector(selector);

const getElements = (selector) => document.querySelectorAll(selector);

const updateElement = ({ selector, property, value }) => {
    const element = getElement(selector);
    if (element) editProperty(element, property, value);
};

const updateElements = (elements) => {
    for (const element in elements) {
        updateElement(elements[element]);
    }
};

const editProperty = (element, properties, value) => {
    const keys = properties.split('.').slice(0, -1);
    const property = properties.split('.').pop();
    let target = element;

    keys.forEach(key => (target = target?.[key] ?? {}));
    target[property] = target ? value : logger('Invalid property!');
};

const getColor = (cost, target, color) => cost.gte(target) ? color : '#455b55';

const toggleModal = (target, callback) => {
    const modal = getElement(`#${target.dataset.modal}`);
    if (callback) callback();
    modal.classList.toggle('collapse');
};

const toggleSetting = (condition) => {
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
};

function eventListener(selector, event, callback) {
    const elements = selector ? getElements(selector) : [document];
    elements.forEach(element => (element ? element.addEventListener(event, callback) : null));
}

export default {
    getElement,
    getElements,
    updateElement,
    updateElements,
    editProperty,
    getColor,
    toggleModal,
    toggleSetting,
    eventListener
};
