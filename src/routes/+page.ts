import { LABEL_SCHEMA_MAP } from '$lib/input/schemas/general-schemas';
import { USER_INPUT_PARAM_NAME } from '$lib/shared/utils/url-util';
import { redirect } from '@sveltejs/kit';

export const load = ({ url }) => {
    const param = url.searchParams.get(USER_INPUT_PARAM_NAME);
    if (!param) {
        const defaultKey = Object.keys(LABEL_SCHEMA_MAP)[0] as keyof typeof LABEL_SCHEMA_MAP;
        const defaultValue = LABEL_SCHEMA_MAP[defaultKey].schema.parse({});
        const encoded = btoa(JSON.stringify(defaultValue));
        redirect(302, `?${USER_INPUT_PARAM_NAME}=${encoded}`);
    }
};