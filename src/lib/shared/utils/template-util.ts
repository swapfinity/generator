/**
 * Generates a string by interpolating properties based on a template.
 * Format: {key|pipe:argument}
 * Supported pipes: prefix, suffix
 * 
 * Example: "{type} {diameter|prefix:M}{length|prefix:x}" 
 * Given properties: { type: "Screw", diameter: 5, length: 20 } -> "Screw M5x20"
 * 
 * If a value is missing, the entire tag (including pipes) is omitted.
 * 
 * @param template 
 * @param properties 
 * @returns 
 */
export const parseTemplate = (template: string, properties: Record<string, unknown>): string => {
    return template.replace(/\{([^}]+)\}/g, (_, match) => {
        const [key, ...pipes] = match.split('|');
        const value = properties[key];

        // if value not present -> omit
        if (value === null || value === undefined || value === '') {
            return '';
        }

        let result = String(value);

        for (const pipeString of pipes) {
            const [action, argument = ''] = pipeString.split(':');

            switch (action) {
                case 'prefix':
                    result = argument + result;
                    break;
                case 'suffix':
                    result = result + argument;
                    break;
            }
        }

        return result;
    });
}
