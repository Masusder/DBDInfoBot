import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

async function initI18next() {
    try {
        await i18next
            .use(Backend)
            .init({
                lng: 'en',
                fallbackLng: 'en',
                ns: ['commands'],
                defaultNS: 'commands',
                backend: {
                    loadPath: 'locales/{{lng}}/{{ns}}.json',
                },
                saveMissing: true, // If true, saves missing translations for debugging
            });

        console.log('i18next initialized successfully');
    } catch (error) {
        console.error('i18next initialization failed:', error);
    }
}

export default initI18next;