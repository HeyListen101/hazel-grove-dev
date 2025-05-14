import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button'; // Adjust path if necessary

describe('Button Component', () => { // Renamed describe block for clarity
  it('renders with default variant and size classes', () => {
    const { container } = render(<Button>Click me</Button>);
    const buttonElement = container.firstChild as HTMLElement;

    // From default variant
    expect(buttonElement).toHaveClass('bg-[#6B5C3D]');
    expect(buttonElement).toHaveClass('text-white');

    // From default size
    expect(buttonElement).toHaveClass('h-12');
    expect(buttonElement).toHaveClass('w-full');
    expect(buttonElement).toHaveClass('px-6');
    expect(buttonElement).toHaveClass('py-2');
    expect(buttonElement).toHaveClass('rounded-md');
    expect(buttonElement).toHaveClass('text-md'); // Note: text-md is unusual, usually text-base, text-lg etc. Check your Tailwind config.
    expect(buttonElement).toHaveClass('font-semibold');

    // From base CVA
    expect(buttonElement).toHaveClass('inline-flex');
    expect(buttonElement).toHaveClass('items-center');
    // ... etc. for other base classes if you want to be exhaustive
  });

  it('renders with outline variant and default size classes', () => {
    const { container } = render(<Button variant="outline">Outline Button</Button>);
    const buttonElement = container.firstChild as HTMLElement;

    // From outline variant
    expect(buttonElement).toHaveClass('bg-white');
    expect(buttonElement).toHaveClass('text-[#6B5C3D]');
    // As per your CVA, 'outline' does NOT have a 'border' class.
    // If you want to assert it doesn't have a border:
    expect(buttonElement).not.toHaveClass('border');

    // From default size (should still apply)
    expect(buttonElement).toHaveClass('h-12');
    expect(buttonElement).toHaveClass('w-full');
  });

  it('renders with destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('bg-destructive'); // Assuming 'bg-destructive' is defined in your Tailwind config
    expect(buttonElement).toHaveClass('text-destructive-foreground');
  });

  it('renders with ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const buttonElement = container.firstChild as HTMLElement;
    // For hover states, you can't directly test the hover class unless you simulate hover,
    // which is more complex. For unit tests, checking the base classes is usually sufficient.
    // If 'hover:bg-accent' is the only class, then it might not have specific base bg/text.
    // Check rendered output if unsure.
    // expect(buttonElement).toHaveClass('some-base-class-for-ghost');
  });

  it('renders with link variant', () => {
    const { container } = render(<Button variant="link">Learn More</Button>);
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('text-primary'); // Assuming 'text-primary' is defined
    expect(buttonElement).toHaveClass('underline-offset-4');
  });

  it('renders with chat variant and chat size', () => {
    // Test a variant and a non-default size together
    const { container } = render(<Button variant="chat" size="chat">Send</Button>);
    const buttonElement = container.firstChild as HTMLElement;

    // From chat variant
    expect(buttonElement).toHaveClass('bg-white/80');
    expect(buttonElement).toHaveClass('text-black');
    expect(buttonElement).toHaveClass('shadow-lg');
    expect(buttonElement).toHaveClass('backdrop-blur-sm');

    // From chat size
    expect(buttonElement).toHaveClass('px-[18]'); // Tailwind will generate this class
    expect(buttonElement).toHaveClass('py-3');
    expect(buttonElement).toHaveClass('text-sm');
    expect(buttonElement).toHaveClass('rounded-[13]'); // Tailwind will generate this class
  });


  it('renders with small size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('h-9');
    expect(buttonElement).toHaveClass('px-4');
    expect(buttonElement).toHaveClass('rounded-md'); // This is also default, but good to check
  });

  it('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#">Link Button</a>
      </Button>
    );
    // Check that the rendered element is an 'a' tag
    const linkElement = screen.getByRole('link', { name: /Link Button/i });
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveTextContent('Link Button');

    // Also check that it has the button styling classes
    expect(linkElement).toHaveClass('bg-[#6B5C3D]'); // Default variant classes
    expect(linkElement).toHaveClass('h-12');       // Default size classes
  });

  it('applies disabled state and classes', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });

    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('disabled:pointer-events-none'); // From base CVA
    expect(buttonElement).toHaveClass('disabled:opacity-50');     // From base CVA
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="my-custom-class">Custom</Button>);
    const buttonElement = container.firstChild as HTMLElement;
    expect(buttonElement).toHaveClass('my-custom-class');
    // Ensure default classes are still there
    expect(buttonElement).toHaveClass('bg-[#6B5C3D]');
  });
});