import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

//===============================
// Local Storage
//===============================
export const getItemFromStore = (key, defaultValue, store = localStorage) => {
    try {
        return store.getItem(key) === null
            ? defaultValue
            : JSON.parse(store.getItem(key));
    } catch {
        return store.getItem(key) || defaultValue;
    }
};

export const setItemToStore = (key, payload, store = localStorage) =>
    store.setItem(key, payload);

//===============================
// String & Number manipulation
//===============================
export const numberFormatter = (number, fixed = 2) => {
    // Nine Zeroes for Billions
    return Math.abs(Number(number)) >= 1.0e9
        ? (Math.abs(Number(number)) / 1.0e9).toFixed(fixed) + 'B'
        : // Six Zeroes for Millions
          Math.abs(Number(number)) >= 1.0e6
          ? (Math.abs(Number(number)) / 1.0e6).toFixed(fixed) + 'M'
          : // Three Zeroes for Thousands
            Math.abs(Number(number)) >= 1.0e3
            ? (Math.abs(Number(number)) / 1.0e3).toFixed(fixed) + 'K'
            : Math.abs(Number(number)).toFixed(fixed);
};

export const capitalize = (str) =>
    (str.charAt(0).toUpperCase() + str.slice(1)).replace(/-/g, ' ');

export const camelize = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

export const dashed = (str) => {
    return str.toLowerCase().replaceAll(' ', '-');
};

export const slugifyText = (str) =>
    str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

export const isIterableArray = (array) =>
    Array.isArray(array) && !!array.length;

// get file size
export const getSize = (size) => {
    if (size < 1024) {
        return `${size} Byte`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
};
