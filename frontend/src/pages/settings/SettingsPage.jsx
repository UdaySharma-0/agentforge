import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Lock, Mail, Moon, Save, Sun, User } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
} from "../../components/ui";
import { useToast } from "../../components/ui/ToastProvider";
import { useTheme } from "../../app/themeContext";
import { updateAuthUser } from "../../app/authSlice";
import * as settingsService from "../../services/settingsService";
import { performLogout } from "../../utils/logout";

const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [preferences, setPreferences] = useState({ timezone: detectedTimezone });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const data = await settingsService.getSettings();
        if (!isMounted) return;

        setProfile({
          name: data.user?.name || "",
          email: data.user?.email || "",
        });
        setPreferences({
          timezone: data.preferences?.timezone || detectedTimezone,
        });
      } catch (error) {
        if (!isMounted) return;
        showToast(error.message || "Failed to load settings", { tone: "error" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handlePreferencesChange = (event) => {
    const { name, value } = event.target;
    setPreferences((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      const data = await settingsService.updateProfile(profile);
      dispatch(updateAuthUser(data.user));
      setProfile({
        name: data.user?.name || "",
        email: data.user?.email || "",
      });
      showToast(data.message || "Profile updated");
    } catch (error) {
      showToast(error.message || "Failed to update profile", { tone: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePreferencesSave = async (event) => {
    event.preventDefault();
    setPreferencesSaving(true);

    try {
      const data = await settingsService.updatePreferences({
        preferences: {
          timezone: preferences.timezone,
        },
      });
      setPreferences({
        timezone: data.preferences?.timezone || "",
      });
      showToast(data.message || "Preferences updated");
    } catch (error) {
      showToast(error.message || "Failed to update preferences", { tone: "error" });
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New password and confirm password must match", { tone: "error" });
      return;
    }

    setPasswordSaving(true);

    try {
      const data = await settingsService.changePassword(passwords);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast(data.message || "Password updated");
    } catch (error) {
      showToast(error.message || "Failed to update password", { tone: "error" });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    if (logoutPending) return;

    setLogoutPending(true);
    await performLogout(dispatch);
    showToast("You've logged out. See you soon!");
    setLogoutPending(false);
    window.location.assign("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage your account details, preferences, and security without affecting
          your existing agents or channels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update the account details tied to your login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProfileSave}>
            <Input
              id="settings-name"
              name="name"
              label="Name"
              value={profile.name}
              onChange={handleProfileChange}
              leftIcon={<User size={16} />}
              required
            />
            <Input
              id="settings-email"
              name="email"
              type="email"
              label="Email"
              value={profile.email}
              onChange={handleProfileChange}
              leftIcon={<Mail size={16} />}
              required
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" isLoading={profileSaving} leftIcon={<Save size={16} />}>
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Theme stays local to this device. Other lightweight preferences can be
            saved to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handlePreferencesSave}>
            <div>
              <p className="mb-3 text-sm font-medium text-[var(--color-text)]">Theme</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={theme === "light" ? "primary" : "secondary"}
                  leftIcon={<Sun size={16} />}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "primary" : "secondary"}
                  leftIcon={<Moon size={16} />}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
              </div>
            </div>

            <Input
              id="settings-timezone"
              name="timezone"
              label="Timezone"
              value={preferences.timezone}
              onChange={handlePreferencesChange}
              hint="Defaults to your browser timezone if left empty."
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                isLoading={preferencesSaving}
                leftIcon={<Save size={16} />}
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password without changing your existing integrations or agent
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handlePasswordSave}>
            <Input
              id="settings-current-password"
              name="currentPassword"
              type="password"
              label="Current Password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={16} />}
              required
            />
            <Input
              id="settings-new-password"
              name="newPassword"
              type="password"
              label="New Password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={16} />}
              required
            />
            <Input
              id="settings-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={16} />}
              required
            />
            <div className="md:col-span-3 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="danger"
                onClick={handleLogout}
                isLoading={logoutPending}
              >
                Logout
              </Button>
              <Button
                type="submit"
                variant="secondary"
                isLoading={passwordSaving}
                leftIcon={<Save size={16} />}
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
