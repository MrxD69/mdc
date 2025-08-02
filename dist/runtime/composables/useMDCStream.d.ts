import { Ref } from 'vue';
export interface MDCStreamOptions {
    language?: string;
    theme?: string;
    allowRecalls?: boolean;
}
export declare function useMDCStream(options?: MDCStreamOptions): {
    content: Readonly<Ref<string>>;
    isStreaming: Readonly<Ref<boolean>>;
    startStream: () => Promise<void>;
    appendContent: (chunk: string) => void;
    endStream: () => void;
    processStream: (stream: ReadableStream<string>) => Promise<void>;
};
