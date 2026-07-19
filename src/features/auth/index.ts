// Schemas
export * from "./schemas/auth.schema";

// Components
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { ResetPasswordForm } from "./components/ResetPasswordForm";
export { PendingApprovalCard } from "./components/PendingApprovalCard";

// Hooks
export { useAuth } from "./hooks/useAuth";
export type { UseAuthReturn } from "./hooks/useAuth";
export { useSignIn } from "./hooks/useSignIn";
export type { UseSignInReturn } from "./hooks/useSignIn";
export { useSignUp } from "./hooks/useSignUp";
export type { UseSignUpReturn } from "./hooks/useSignUp";
export { useSignOut } from "./hooks/useSignOut";
export type { UseSignOutReturn } from "./hooks/useSignOut";
export { useRequireApproval } from "./hooks/useRequireApproval";

// Types
export * from "./types";

// Services
export {
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  requestPasswordReset,
  resetPassword,
} from "./services/auth.service";

export type { SignUpServiceInput } from "./services/auth.service";

export {
  getProfile,
  getMyProfile,
  updateProfile,
} from "./services/profile.service";

export type { UpdateProfileResult } from "./services/profile.service";
