export interface Logger {
	info(msg: string, meta?: object): void;
	warn(msg: string, meta?: object): void;
	error(msg: string, meta?: object): void;
	debug(msg: string, meta?: object): void;
	child(bindings: object): Logger;
}

export const noopLogger: Logger = {
	info: () => {},
	warn: () => {},
	error: () => {},
	debug: () => {},
	child: () => noopLogger,
};
