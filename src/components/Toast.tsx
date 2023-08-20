type ToastProps = {
    message: string | null;
    type: 'success' | 'error';
  };

export type {ToastProps};
  

export default function Toast (props: ToastProps) {
    const {message, type} = props;

    if (!message) return null;  // Add this line

    return (
      <div className={`fixed top-0 left-0 right-0 py-2 px-4 text-white text-center transform transition-transform duration-300 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} ${!message ? 'translate-y-full' : 'translate-y-0'}`}>
        {message}
      </div>
    );
  }