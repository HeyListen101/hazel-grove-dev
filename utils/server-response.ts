import { redirect } from 'next/navigation';

type ResponseType = 'success' | 'error';

type ServerResponse = {
  type: ResponseType;
  message: string;
  redirectPath?: string;
};

export function createResponse(type: ResponseType, message: string, redirectPath?: string): ServerResponse {
  return {
    type,
    message,
    redirectPath
  };
}

export function handleResponse(response: ServerResponse): void {
  if (response.redirectPath) { 
    redirect(response.redirectPath); 
  }
}