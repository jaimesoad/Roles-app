export class LatestSearch {
    private timer: ReturnType<typeof setTimeout> | undefined;
    private requestId = 0;

    schedule(run: (requestId: number) => void, delay = 350) {
        clearTimeout(this.timer);
        const requestId = ++this.requestId;
        this.timer = setTimeout(() => run(requestId), delay);
    }

    start() {
        clearTimeout(this.timer);
        return ++this.requestId;
    }

    isCurrent(requestId: number) {
        return requestId === this.requestId;
    }

    cancel() {
        clearTimeout(this.timer);
        this.requestId++;
    }
}
