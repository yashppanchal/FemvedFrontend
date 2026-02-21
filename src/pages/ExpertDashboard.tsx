import { type FormEvent, useState } from "react";
import "./ExpertDashboard.scss";

type ExpertAccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
};


export default function ExpertDashboard() {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ExpertAccountForm>({
    firstName: "Jane",
    lastName: "Doe",
    email: "expert@example.com",
    phone: "+91 9876543210",
    specialty: "Holistic Wellness Coach",
    bio: "Helping women build sustainable wellness habits through personalized care plans.",
  });

  const setField =
    (field: keyof ExpertAccountForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaveMessage(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAccountSave = (e: FormEvent) => {
    e.preventDefault();
    setSaveMessage("Account details saved.");
  };

  return (
    <section className="page page--expertDashboard">
      <h1 className="page__title">Expert Dashboard</h1>
      <p className="page__lead">Manage your profile, learners, and programs.</p>

      <div className="expertContent">
        <section className="expertSection">
          <h2 className="expertSection__title">Edit Account</h2>
          {saveMessage && <p className="expertSection__success">{saveMessage}</p>}

          <form className="form expertForm" onSubmit={handleAccountSave} noValidate>
            <div className="expertForm__row">
              <label className="field">
                <span className="field__label">First name</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.firstName}
                  onChange={setField("firstName")}
                />
              </label>

              <label className="field">
                <span className="field__label">Last name</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.lastName}
                  onChange={setField("lastName")}
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
              />
            </label>

            <label className="field">
              <span className="field__label">Phone</span>
              <input
                className="field__input"
                type="tel"
                value={form.phone}
                onChange={setField("phone")}
              />
            </label>

            <label className="field">
              <span className="field__label">Specialty</span>
              <input
                className="field__input"
                type="text"
                value={form.specialty}
                onChange={setField("specialty")}
              />
            </label>

            <label className="field">
              <span className="field__label">Bio</span>
              <textarea
                className="field__input expertForm__textarea"
                value={form.bio}
                onChange={setField("bio")}
              />
            </label>

            <button type="submit" className="button expertForm__submit">
              Save Account
            </button>
          </form>
        </section>

      </div>
    </section>
  );
}
