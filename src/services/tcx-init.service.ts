import init from '@consenlabs/tcx-wasm';
import wasmUrl from '@consenlabs/tcx-wasm/tcx_wasm_bg.wasm?url';

let tcxReady = false;

export async function ensureTcxInit(): Promise<void> {
  if (!tcxReady) {
    await init(wasmUrl);
    tcxReady = true;
  }
}
