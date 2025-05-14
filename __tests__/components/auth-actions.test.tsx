import {
    signUpAction,
    customSignInAction,
    googleSignInAction,
    forgotPasswordAction,
    resetPasswordAction,
  } from "@/app/server/auth-actions";
  import { redirect } from "next/navigation";
  import { encodedRedirect } from "@/utils/utils";
  
  // --- MOCKS ---
  // Mock next/navigation
  jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
  }));
  
  // Mock @/utils/utils
  jest.mock("@/utils/utils", () => ({
    encodedRedirect: jest.fn((status, path, message) => ({ status, path, message })),
  }));
  
  // Mock next/headers
  const mockHeadersGet = jest.fn();
  jest.mock("next/headers", () => ({
    headers: jest.fn(() => ({
      get: mockHeadersGet,
    })),
  }));
  
  // Mock @/utils/supabase/server and the client it returns
  const mockSupabaseAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(), // Though not directly tested here, good to have if other actions use it
  };
  const mockSupabaseFrom = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };
  const mockSupabaseClient = {
    auth: mockSupabaseAuth,
    from: jest.fn(() => mockSupabaseFrom),
  };
  
  jest.mock("@/utils/supabase/server", () => ({
    createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)), // createClient is async
  }));
  
  // Helper to create FormData
  const createFormData = (data: Record<string, string>): FormData => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  };
  
  describe("Authentication Actions", () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
      mockHeadersGet.mockReturnValue("http://localhost:3000"); // Default origin
    });
  
    // --- AUTH-0001: Email Validation (Tested implicitly via actions) ---
    // We'll test this through signUpAction and customSignInAction.
    // The isValidEmail function is not exported, so we test its effect.
    describe("AUTH-0001: Email Validation", () => {
      it("signUpAction should reject invalid email formats", async () => {
        const formData = createFormData({
          email: "invalid-email",
          password: "password123",
          username: "testuser",
          affiliation: "tester",
        });
        await signUpAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith(
          "error",
          "/sign-up",
          "Invalid email address"
        );
      });
  
      it("customSignInAction should reject invalid email formats", async () => {
          const formData = createFormData({
            email: "invalid-email",
            password: "password123",
          });
          await customSignInAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith(
            "error",
            "/sign-in",
            "Invalid email address"
          );
        });
    });
  
  
    // --- AUTH-0002: Password Validation ---
    describe("AUTH-0002: Password Validation (Min 8 Chars)", () => {
      it("signUpAction should reject passwords less than 8 characters", async () => {
        const formData = createFormData({
          email: "test@example.com",
          password: "short", // < 8 chars
          username: "testuser",
          affiliation: "tester",
        });
        await signUpAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith(
          "error",
          "/sign-up",
          "Password must be at least 8 characters long"
        );
      });
  
      // resetPasswordAction also has password validation (though it's 'password !== confirmPassword')
      // but the core length validation is primarily on sign-up.
    });
  
    // --- AUTH-0003: Injection Prevention ---
    // The detectInjection function is not exported, so we test its effect.
    describe("AUTH-0003: Injection Prevention", () => {
      const injectionPayload = "<script>alert('xss')</script>";
      it("signUpAction should prevent injection in email", async () => {
        const formData = createFormData({ email: injectionPayload, password: "password123", username: "user", affiliation: "aff" });
        await signUpAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-up", "Tsk tsk tsk! No injections here!");
      });
      it("signUpAction should prevent injection in password", async () => {
          const formData = createFormData({ email: "a@b.com", password: injectionPayload, username: "user", affiliation: "aff" });
          await signUpAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-up", "Tsk tsk tsk! No injections here!");
        });
      it("customSignInAction should prevent injection in email", async () => {
        const formData = createFormData({ email: injectionPayload, password: "password123" });
        await customSignInAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-in", "Tsk tsk tsk! No injections here!");
      });
      it("forgotPasswordAction should prevent injection in email", async () => {
          const formData = createFormData({ email: injectionPayload });
          await forgotPasswordAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith("error", "/forgot-password", "Tsk tsk tsk! No injections here!");
        });
    });
  
    // --- AUTH-0004: Sign Up Flow ---
    describe("AUTH-0004: Sign Up Flow", () => {
      it("should successfully sign up a new user", async () => {
        mockSupabaseFrom.single.mockResolvedValueOnce({ data: null, error: null }); // No existing user
        mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: {}, error: null });
        const formData = createFormData({
          email: "newuser@example.com",
          password: "password123",
          username: "newuser",
          affiliation: "tester",
        });
        await signUpAction(formData);
        expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
          email: "newuser@example.com",
          password: "password123",
          options: {
            emailRedirectTo: "http://localhost:3000/auth/callback",
            data: {
              name: "newuser",
              affiliation: "tester",
            },
          },
        });
        expect(encodedRedirect).toHaveBeenCalledWith(
          "success",
          "/sign-in",
          "Thanks for signing up! Please check your email for a verification link."
        );
      });
  
      it("should return error if email is already registered", async () => {
        mockSupabaseFrom.single.mockResolvedValueOnce({ data: { id: "123", emailaddress: "existing@example.com" }, error: null }); // Existing user
        const formData = createFormData({
          email: "existing@example.com",
          password: "password123",
          username: "testuser",
          affiliation: "tester",
        });
        await signUpAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith(
          "error",
          "/sign-up",
          "Email is already registered"
        );
      });
  
      it("should return error if Supabase signUp fails", async () => {
          mockSupabaseFrom.single.mockResolvedValueOnce({ data: null, error: null });
          mockSupabaseAuth.signUp.mockResolvedValueOnce({ error: { message: "Supabase error", code: "500" } });
          const formData = createFormData({
            email: "test@example.com",
            password: "password123",
            username: "testuser",
            affiliation: "tester",
          });
          await signUpAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith(
            "error",
            "/sign-up",
            "Supabase error"
          );
        });
  
        it("should require all fields", async () => {
          const formData = createFormData({ email: "test@example.com", password: "password123" /* username missing */ });
          await signUpAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-up", "All fields are required");
        });
    });
  
    // --- AUTH-0005: Sign In Flow ---
    describe("AUTH-0005: Sign In Flow", () => {
      it("should successfully sign in an existing user", async () => {
        mockSupabaseFrom.single.mockResolvedValueOnce({ data: { id: "123", emailaddress: "user@example.com" }, error: null }); // User exists
        mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: null });
        const formData = createFormData({
          email: "user@example.com",
          password: "password123",
        });
        await customSignInAction(formData);
        expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "password123",
        });
        expect(redirect).toHaveBeenCalledWith("/protected");
      });
  
      it("should return error for non-existent email", async () => {
          mockSupabaseFrom.single.mockResolvedValueOnce({ data: null, error: null }); // User does not exist
          const formData = createFormData({
            email: "nouser@example.com",
            password: "password123",
          });
          await customSignInAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith(
            "error",
            "/sign-in",
            "Unfortunately, we don't have that email registered in our system. Please check your spelling or contact us if you think this is an error."
          );
        });
  
      it("should return error for wrong credentials", async () => {
        mockSupabaseFrom.single.mockResolvedValueOnce({ data: { id: "123", emailaddress: "user@example.com" }, error: null });
        mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });
        const formData = createFormData({
          email: "user@example.com",
          password: "wrongpassword",
        });
        await customSignInAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-in", "Wrong credentials");
      });
  
      it("should require email and password", async () => {
          const formData = createFormData({ email: "user@example.com" /* password missing */ });
          await customSignInAction(formData);
          expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-in", "Email and password are required");
        });
    });
  
    // --- AUTH-0006: OAuth Integration (Google) ---
    describe("AUTH-0006: OAuth Integration (Google)", () => {
      it("should redirect to Google OAuth URL on successful initiation", async () => {
        const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?...";
        mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({ data: { url: googleAuthUrl }, error: null });
        await googleSignInAction();
        expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
          options: {
            redirectTo: "http://localhost:3000/auth/callback",
          },
        });
        expect(redirect).toHaveBeenCalledWith(googleAuthUrl);
      });
  
      it("should return error if Supabase OAuth initiation fails", async () => {
        mockSupabaseAuth.signInWithOAuth.mockResolvedValueOnce({ data: null, error: { message: "OAuth provider error" } });
        await googleSignInAction();
        expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-in", "OAuth provider error");
      });
    });
  
    // --- AUTH-0007: Password Reset ---
    describe("AUTH-0007: Password Reset Flow", () => {
      describe("forgotPasswordAction", () => {
          it("should send reset link for existing email", async () => {
              mockSupabaseFrom.maybeSingle.mockResolvedValueOnce({ data: { id: "123", emailaddress: "user@example.com" }, error: null });
              mockSupabaseAuth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });
              const formData = createFormData({ email: "user@example.com" });
              await forgotPasswordAction(formData);
              expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
                "user@example.com",
                { redirectTo: "http://localhost:3000/auth/callback?redirect_to=/reset-password" }
              );
              expect(encodedRedirect).toHaveBeenCalledWith(
                "success",
                "/sign-in",
                "Check your email for a link to reset your password"
              );
            });
  
            it("should show error for non-existent email", async () => {
              mockSupabaseFrom.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
              const formData = createFormData({ email: "nouser@example.com" });
              await forgotPasswordAction(formData);
              expect(encodedRedirect).toHaveBeenCalledWith(
                "error",
                "/forgot-password",
                "Unfortunately, we don't have that email registered in our system. Please check your spelling or contact us if you think this is an error."
              );
            });
  
            it("should require email", async () => {
              const formData = createFormData({});
              await forgotPasswordAction(formData);
              expect(encodedRedirect).toHaveBeenCalledWith("error", "/forgot-password", "Email is required");
            });
      });
  
      describe("resetPasswordAction", () => {
          it("should successfully update password", async () => {
              mockSupabaseAuth.updateUser.mockResolvedValueOnce({ data: {}, error: null });
              const formData = createFormData({ password: "newPassword123", confirmPassword: "newPassword123" });
              // Note: resetPasswordAction doesn't await the encodedRedirect for success,
              // it calls it and then execution continues. So we check the call.
              await resetPasswordAction(formData);
              expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({ password: "newPassword123" });
              expect(encodedRedirect).toHaveBeenCalledWith("success", "/sign-in", "Your password has been updated!");
          });
  
          it("should return error if passwords do not match", async () => {
              const formData = createFormData({ password: "newPassword123", confirmPassword: "differentPassword" });
              await resetPasswordAction(formData);
              // For resetPasswordAction, encodedRedirect is called but not returned or awaited in error cases.
              // So, we check if it was called.
              expect(encodedRedirect).toHaveBeenCalledWith("error", "/reset-password", "Passwords do not match");
          });
  
          it("should return error if Supabase updateUser fails", async () => {
              mockSupabaseAuth.updateUser.mockResolvedValueOnce({ error: { message: "Update failed" } });
              const formData = createFormData({ password: "newPassword123", confirmPassword: "newPassword123" });
              await resetPasswordAction(formData);
              expect(encodedRedirect).toHaveBeenCalledWith("error", "/reset-password", "Update failed");
            });
      });
    });
  
    // --- AUTH-0008: Rate Limiting ---
    describe("AUTH-0008: Rate Limiting (Conceptual Test)", () => {
      it("signInAction should theoretically handle a rate limit error from Supabase", async () => {
        mockSupabaseFrom.single.mockResolvedValueOnce({ data: { id: "123", emailaddress: "user@example.com" }, error: null });
        mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
          error: { message: "Too many requests", name: "AuthApiError", status: 429 },
        });
        const formData = createFormData({ email: "user@example.com", password: "password123" });
        await customSignInAction(formData);
        expect(encodedRedirect).toHaveBeenCalledWith("error", "/sign-in", "Too many sign-in attempts. Please try again later.");
      });
    });
  });