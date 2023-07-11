export default function timeOut(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, ms);
	});
}
