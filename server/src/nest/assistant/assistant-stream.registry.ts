/**
 * The assistant turns running right now, one per user, as an injectable port.
 * A second window asking while one turn streams is refused (`busy`) instead of
 * running two turns over the same conversation; "continue here" stops the
 * running one (`abort`) and asks again. In memory today; a registry shared
 * between processes replaces InMemoryAssistantStreamRegistry in
 * AssistantModule.
 */
export abstract class AssistantStreamRegistry {
  /** Registers the turn's controller; false when the user already has one running. */
  abstract claim(userId: number, controller: AbortController): Promise<boolean>;
  /** Forgets the turn, if it is still the one registered. */
  abstract release(userId: number, controller: AbortController): Promise<void>;
  /** Associates a claimed turn with its saved conversation. */
  abstract bind(userId: number, controller: AbortController, threadId: number): Promise<void>;
  abstract isRunning(userId: number, threadId: number): Promise<boolean>;
  /** Stops and drains the turn before another can start; an optional thread id limits the stop. */
  abstract abort(userId: number, threadId?: number): Promise<boolean>;
}

interface RunningTurn {
  controller: AbortController;
  threadId: number | null;
  done: Promise<void>;
  finish: () => void;
}

export class InMemoryAssistantStreamRegistry extends AssistantStreamRegistry {
  // shortcut: a server restart stops these turns; use durable jobs when running multiple processes.
  private readonly running = new Map<number, RunningTurn>();

  claim(userId: number, controller: AbortController): Promise<boolean> {
    if (this.running.has(userId)) return Promise.resolve(false);
    let finish!: () => void;
    const done = new Promise<void>((resolve) => (finish = resolve));
    this.running.set(userId, { controller, threadId: null, done, finish });
    return Promise.resolve(true);
  }

  release(userId: number, controller: AbortController): Promise<void> {
    const current = this.running.get(userId);
    if (current?.controller === controller) {
      this.running.delete(userId);
      current.finish();
    }
    return Promise.resolve();
  }

  bind(userId: number, controller: AbortController, threadId: number): Promise<void> {
    const current = this.running.get(userId);
    if (current?.controller === controller) current.threadId = threadId;
    return Promise.resolve();
  }

  isRunning(userId: number, threadId: number): Promise<boolean> {
    return Promise.resolve(this.running.get(userId)?.threadId === threadId);
  }

  async abort(userId: number, threadId?: number): Promise<boolean> {
    const current = this.running.get(userId);
    if (!current || (threadId !== undefined && current.threadId !== threadId)) return false;
    current.controller.abort();
    await current.done;
    return true;
  }
}
