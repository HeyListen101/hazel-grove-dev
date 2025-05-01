export function ErrorDisplay({ message }: { message: string }) {
    return (
      <div 
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" 
        role="alert"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    );
  }