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

// TEST FUNCTIONS

// const editProperty2 = (element, path, value) => {
//     const keys = path.split('.').slice(0, -1);
//     const property = path.split('.').pop();
//     let target = element;

//     keys.forEach(key => (target = target?.[key] ?? {}));
//     if (target) target[property] = value;
// };

// const updateElement2 = (element, property) => {
//     if (!(element instanceof Object)) return;
//     editProperty2(element, property.path, property.value);
// };
// const updateElements2 = (elements, properties) => {
//     // Object.entries(elements).forEach(([key, value]) => {
//     //     console.log(elements[key], value);
//     // });
//     for (const element in elements) {
//         if (!elements[element]) continue;
//         updateElement2(elements[element], properties[element]);
//     }
// };

const editProperty = (element, properties, value) => {
    const keys = properties.split('.').slice(0, -1);
    const property = properties.split('.').pop();
    let target = element;

    keys.forEach(key => (target = target?.[key] ?? {}));
    if (target) target[property] = value;
};

const getColor = (value, cost, color, dull) => value.gte(cost) ? color : dull;

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
    return message;
};

function eventListener(selector, event, callback) {
    const elements = selector ? getElements(selector) : [document];
    elements.forEach(element => (element ? element.addEventListener(event, callback) : null));
}

const mapConfig = (config) => {
    return Object.entries(config).reduce((map, [key]) => {
        const element = isNaN(config[key].charAt(1)) && getElement(config[key]);
        map[toCamelCase(key)] = element ? getElement(config[key]) : config[key];
        return map;
    }, {});
};

const mergeConfig = (elements, properties) => {
    return Object.entries(elements).reduce((map, [key]) => {
        map[key] = { ...elements[key], ...properties[key] };
        return map;
    }, {});
};

const toCamelCase = (variable) => {
    const words = variable.split('_').map(word => (
        `${word.charAt(0)}${word.slice(1).toLowerCase()}`
    )).join('');
    return `${words.charAt(0).toLowerCase()}${words.slice(1)}`;
};

export default {
    getElement,
    getElements,
    updateElement,
    updateElements,
    // updateElement2,
    // updateElements2,
    editProperty,
    getColor,
    toggleModal,
    toggleSetting,
    eventListener,
    mapConfig,
    mergeConfig
};
