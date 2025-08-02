import type { MDCParseOptions } from '@nuxtjs/mdc';
import { CodeToTokenTransformStream } from 'shiki-stream';
interface MDCStreamProps {
    value?: string;
    tag?: string;
    excerpt?: boolean;
    components?: Record<string, any>;
    options?: MDCParseOptions;
    isStreaming?: boolean;
    streamLanguage?: string;
    streamTheme?: string;
}
declare const _default: import("vue").DefineComponent<MDCStreamProps, {
    parseContent: (content: string) => Promise<void>;
    handleStreamingContent: (content: string) => Promise<void>;
    createStreamingHighlighter: () => Promise<CodeToTokenTransformStream | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<MDCStreamProps> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
