import { LABEL_SCHEMA_MAP, type LabelDefinition } from "$lib/input/schemas/general-schemas";
import { parseTemplate } from "$lib/shared/utils/template-util";
import { packageSchema } from "../schemas/package-schema";

const LABEL_PACKAGE_KEY = "swapfinity-label-generator:package"
const LABEL_PACKAGE_MAX_SIZE = 100

const isDeepEqual = (a: LabelDefinition, b: LabelDefinition): boolean => JSON.stringify(a) === JSON.stringify(b);

class Package {
    labels = $state<LabelDefinition[]>([]);

    filenames = $derived.by(() => {
        const nameCount = new Map<string, number>();
        let genericCounter = 0;

        return this.labels.map((label) => {
            const entry = LABEL_SCHEMA_MAP[label.type];

            if (entry.nameTemplate) {
                let baseName = parseTemplate(entry.nameTemplate, label);
                baseName = baseName.replace(/[\\/:"*?<>|]/g, '_').trim();

                const count = nameCount.get(baseName) ?? 0;
                nameCount.set(baseName, count + 1);

                return count === 0 ? baseName : `${baseName}_${count}`;
            } else {
                genericCounter++;
                return `label_${genericCounter}`;
            }
        });
    });

    constructor(private maxSize: number = LABEL_PACKAGE_MAX_SIZE) {
        this.labels = this.load();
    }

    contains = (label: LabelDefinition | null): boolean => {
        if (!label) {
            return false;
        }

        return this.labels.some(existing => isDeepEqual(existing, label));
    }

    add = (label: LabelDefinition | null): void => {
        if (!label || this.labels.length >= this.maxSize || this.contains(label)) {
            return;
        }
        this.labels.push(label);
        this.save();
    }

    remove = (index: number): void => {
        this.labels.splice(index, 1);
        this.save();
    }

    clear = (): void => {
        this.labels = [];
        this.save();
    }

    get count(): number {
        return this.labels.length;
    }

    get maxCount(): number {
        return this.maxSize;
    }

    get isFull(): boolean {
        return this.labels.length >= this.maxSize;
    }

    private save(): void {
        localStorage.setItem(LABEL_PACKAGE_KEY, JSON.stringify(this.labels));
    }

    private load(): LabelDefinition[] {
        try {
            const stored = localStorage.getItem(LABEL_PACKAGE_KEY);
            if (!stored) {
                return [];
            }
            return packageSchema.parse(JSON.parse(stored));
        } catch {
            return [];
        }
    }
}

export const packageStore = new Package();