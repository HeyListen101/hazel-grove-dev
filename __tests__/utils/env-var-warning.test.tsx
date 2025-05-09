import { render, screen } from '@testing-library/react'
import { EnvVarWarning } from '@/components/env-var-warning'

describe('EnvVarWarning', () => {
  it('renders the warning message', () => {
    render(<EnvVarWarning />)
    
    expect(screen.getByText('Supabase environment variables required')).toBeInTheDocument()
  })
  
  it('renders disabled sign in and sign up buttons', () => {
    render(<EnvVarWarning />)
    
    const signInButton = screen.getByText('Sign in').closest('button')
    const signUpButton = screen.getByText('Sign up').closest('button')
    
    expect(signInButton).toBeDisabled()
    expect(signUpButton).toBeDisabled()
  })
})