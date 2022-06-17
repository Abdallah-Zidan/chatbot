import { Request, Response } from "express";

function extract(obj: any, props: string[]) {
  return props.reduce((acc: any, prop) => {
    acc[prop] = obj[prop];
    return acc;
  }, {});
}

export function transformExpressRequest(req: Request, props?: string[]): any {
  const defaultProps = ["method", "url", "headers", "body"];
  props = [...defaultProps, ...(props || [])];
  return extract(req, props);
}

export function transformExpressResponse(res: Response): any {
  return {
    statusCode: res.statusCode,
    headers: res.getHeaders(),
    body: res.body,
    statusMessage: res.statusMessage,
  };
}

export function transformError(err: Error) {
  return extract(err, [
    "message",
    "stack",
    "code",
    "name",
    "errno",
    "syscall",
    "path",
    "info",
    "meta",
    "errors",
  ]);
}
