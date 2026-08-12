import { WebContainer } from "@webcontainer/api";

const globalForWC = globalThis as unknown as {
  webcontainerPromise?: Promise<WebContainer>;
};

export async function getWebContainer(): Promise<WebContainer> {
  if (!globalForWC.webcontainerPromise) {
    globalForWC.webcontainerPromise = WebContainer.boot({
      coep: "credentialless"
    }).catch((err) => {
      delete globalForWC.webcontainerPromise;
      throw err;
    });
  }

  return globalForWC.webcontainerPromise;
}

export async function mountProject(files: any): Promise<WebContainer> {
  const wc = await getWebContainer();
  await wc.mount(files);
  return wc;
}

export async function readDirectory(wc: WebContainer, path = "/") {
  return await wc.fs.readdir(path, { withFileTypes: true });
}
