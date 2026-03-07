import { type FormEvent, useEffect, useState } from "react";
import {
  fetchCurrentExpertProfile,
  upsertCurrentExpertProfile,
} from "../api/experts";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import "./ExpertDashboard.scss";

type ExpertAccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
};

const initialExpertForm: ExpertAccountForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  specialty: "",
  bio: "",
};

const splitDisplayName = (displayName: string): { firstName: string; lastName: string } => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

export default function ExpertDashboard() {
  const { tokens, user } = useAuth();
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [form, setForm] = useState<ExpertAccountForm>(initialExpertForm);
  const [savedForm, setSavedForm] = useState<ExpertAccountForm>(initialExpertForm);

  useEffect(() => {
    const accessToken = tokens?.accessToken;
    if (!accessToken) return;

    let isActive = true;
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        setSaveErrorMessage(null);

        const profile = await fetchCurrentExpertProfile(accessToken);
        if (!isActive) return;

        const { firstName, lastName } = splitDisplayName(profile.displayName);
        const populatedForm: ExpertAccountForm = {
          firstName,
          lastName,
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          specialty: profile.title ?? "",
          bio: profile.bio ?? "",
        };
        setForm(populatedForm);
        setSavedForm(populatedForm);
      } catch (err) {
        if (!isActive) return;
        if (err instanceof ApiError) {
          setSaveErrorMessage(err.message);
        } else {
          setSaveErrorMessage("Unable to load your profile details.");
        }
      } finally {
        if (!isActive) return;
        setIsProfileLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [tokens?.accessToken, user?.email, user?.phone]);

  const setField =
    (field: keyof ExpertAccountForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAccountSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setSaveErrorMessage("You must be logged in to update your profile.");
      return;
    }

    const displayName = `${form.firstName} ${form.lastName}`.trim();
    const title = form.specialty.trim();
    const bio = form.bio.trim();

    if (!displayName || !title || !bio) {
      setSaveErrorMessage("Name, specialty, and bio are required.");
      return;
    }

    try {
      setIsSavingAccount(true);
      await upsertCurrentExpertProfile(
        {
          displayName,
          title,
          bio,
          gridDescription: bio,
          detailedDescription: bio,
          profileImageUrl: "",
          gridImageUrl: "",
          specialisations: [title],
          yearsExperience: 0,
          credentials: [],
          locationCountry: "",
          isActive: true,
        },
        accessToken,
      );
      setSavedForm(form);
      setIsEditingAccount(false);
      setSaveSuccessMessage("Account details saved.");
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveErrorMessage(err.message);
      } else {
        setSaveErrorMessage("Unable to save account details. Please try again.");
      }
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleStartEdit = () => {
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    setIsEditingAccount(true);
  };

  const handleCancelEdit = () => {
    setForm(savedForm);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
    setIsEditingAccount(false);
  };

  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">Expert Dashboard</h1>
      <p className="page__lead">Manage your profile, learners, and programs.</p>

      <div className="expertContent">
        <section className="expertSection">
          <div className="expertSection__header">
            <h2 className="expertSection__title">Account</h2>
            {!isProfileLoading && !isEditingAccount && (
              <button type="button" className="button" onClick={handleStartEdit}>
                Edit
              </button>
            )}
          </div>
          {saveSuccessMessage && (
            <p className="expertSection__success">{saveSuccessMessage}</p>
          )}
          {saveErrorMessage && <p className="form__error">{saveErrorMessage}</p>}
          {isProfileLoading && <p className="form__help">Loading profile details...</p>}

          {!isProfileLoading && !isEditingAccount && (
            <div className="expertProfileDetails">
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">First name</span>
                <span className="expertProfileDetails__value">
                  {form.firstName || "-"}
                </span>
              </div>
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">Last name</span>
                <span className="expertProfileDetails__value">
                  {form.lastName || "-"}
                </span>
              </div>
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">Email</span>
                <span className="expertProfileDetails__value">{form.email || "-"}</span>
              </div>
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">Phone</span>
                <span className="expertProfileDetails__value">{form.phone || "-"}</span>
              </div>
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">Specialty</span>
                <span className="expertProfileDetails__value">
                  {form.specialty || "-"}
                </span>
              </div>
              <div className="expertProfileDetails__row">
                <span className="expertProfileDetails__label">Bio</span>
                <span className="expertProfileDetails__value">{form.bio || "-"}</span>
              </div>
            </div>
          )}

          {isEditingAccount && (
            <form className="form expertForm" onSubmit={handleAccountSave} noValidate>
              <div className="expertForm__row">
                <label className="field">
                  <span className="field__label">First name</span>
                  <input
                    className="field__input"
                    type="text"
                    value={form.firstName}
                    onChange={setField("firstName")}
                    disabled={isProfileLoading}
                  />
                </label>

                <label className="field">
                  <span className="field__label">Last name</span>
                  <input
                    className="field__input"
                    type="text"
                    value={form.lastName}
                    onChange={setField("lastName")}
                    disabled={isProfileLoading}
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                  disabled={isProfileLoading}
                />
              </label>

              <label className="field">
                <span className="field__label">Phone</span>
                <input
                  className="field__input"
                  type="tel"
                  value={form.phone}
                  onChange={setField("phone")}
                  disabled={isProfileLoading}
                />
              </label>

              <label className="field">
                <span className="field__label">Specialty</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.specialty}
                  onChange={setField("specialty")}
                  disabled={isProfileLoading}
                />
              </label>

              <label className="field">
                <span className="field__label">Bio</span>
                <textarea
                  className="field__input expertForm__textarea"
                  value={form.bio}
                  onChange={setField("bio")}
                  disabled={isProfileLoading}
                />
              </label>

              <div className="expertForm__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={handleCancelEdit}
                  disabled={isSavingAccount || isProfileLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button expertForm__submit"
                  disabled={isSavingAccount || isProfileLoading}
                >
                  {isSavingAccount ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          )}
        </section>

      </div>
    </section>
  );
}
