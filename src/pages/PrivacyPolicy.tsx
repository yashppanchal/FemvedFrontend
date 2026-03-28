import type { ReactNode } from "react";
import "./Terms.scss";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="terms__link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function PrivacyPolicy() {
  return (
    <section className="page terms">
      <div className="terms__hero">
        <p className="terms__heroLabel">Legal</p>
        <h1 className="terms__heroTitle">Privacy Policy</h1>
        <p className="terms__revised">Last revised: March 2026</p>
      </div>

      <div className="terms__body">
        <p className="terms__intro">
          <strong>Femved Wellness Private Limited</strong>
        </p>

        <p>
          We, Femved Wellness, Mumbai, India, are committed to protecting
          privacy of users of the Femved website, Femved application(s), and/or
          other related services (hereinafter collectively the &quot;Femved
          Services&quot; or the &quot;Services&quot;).
        </p>

        <p>
          For the purposes of this Privacy Policy, Femved Wellness is the
          &quot;data controller&quot; for all Femved Services.
        </p>

        <p>
          This Privacy Policy describes the types of personal and non-personal
          data we collect and how we use such data. This Privacy Policy is part
          of our General Terms and Conditions and applies to all Femved Wellness
          Services. Therefore, please make sure that you read and understand our
          Privacy Policy, as well as the General Terms and Conditions.
        </p>

        <p>
          This Privacy Policy does not apply to any third-party websites,
          services or applications, even if they may be accessible through the
          Femved Wellness Services.
        </p>

        <p className="terms__highlight">
          By using any of the Femved Wellness Services, you hereby warrant and
          represent that (i) you have read, understand and agree to this Privacy
          Policy, (ii) you are over 18 years of age (or are a parent or guardian
          with such authority to agree to this Privacy Policy for the benefit of
          an individual who is under 18 years of age). If you do not accept the
          terms set forth in this Privacy Policy and the consents associated
          therewith, please do not use our Services.
        </p>

        {/* ── 1 ── */}
        <h2 className="terms__heading">
          1. What types and categories of data we collect, process and use?
        </h2>

        <p>We collect, process and use personal and non-personal data.</p>

        <h3 className="terms__subheading">
          1.1 Personal and non-personal data
        </h3>

        <p>
          The term &quot;personal data&quot; is defined by the Federal Data
          Protection Act (BDSG) and the European General Data Protection
          Regulation (GDPR). You can think of your personal data as any data
          that allow you to be identified or that can be correlated to you.
        </p>

        <p>
          On the other hand, &quot;non-personal&quot; data cannot be correlated
          to any specific person. By removing identifiable parts from and
          anonymizing personal data, personal data may be converted into
          &quot;non-personal data.&quot;
        </p>

        <h3 className="terms__subheading">
          1.2 Data we collect, process and use
        </h3>

        <p>We collect, process and use three types of data:</p>

        <ul className="terms__list terms__list--bullet">
          <li>data you provide to us voluntarily,</li>
          <li>data we receive when you use our Services, and</li>
          <li>data we receive from third parties.</li>
        </ul>

        <p>
          Typically, we collect, process and use the following categories of
          data:
        </p>

        <ul className="terms__list terms__list--bullet">
          <li>your name and address;</li>
          <li>
            your personal contact information (telephone, e-mail, fax, etc.);
          </li>
          <li>your username and password;</li>
          <li>your user profile data (e.g., workout schedule);</li>
          <li>your user preferences (e.g., preferred language settings);</li>
          <li>
            your IP address, operating system, browser type, browser version,
            browser configuration, name of Internet provider, and any other
            relevant information regarding your computer and Internet connection
            in order to identify the type of your device, to connect you to the
            website, to exchange data with your (mobile) terminal device, or to
            ensure proper use of the website and an Femved Wellness application;
          </li>
          <li>
            the URL and IP address of the website from which you access our
            website or from which you are transferred to our website, including
            date and time;
          </li>
          <li>
            any pages of our website on which you click during your visit, and
            any links on our website on which you click, including date and
            time;
          </li>
          <li>
            the entire Uniform Resource Locator (URL) clickstream regarding,
            through, and from the website, including date and time;
          </li>
          <li>Your service inquiries and your orders;</li>
          <li>
            your transaction history, including open and completed transactions;
          </li>
          <li>search terms you input in relation to or within our Services;</li>
          <li>information regarding your orders and payments;</li>
          <li>
            information collected by cookies or similar technologies (as
            explained below);
          </li>
          <li>
            your survey answers, critiques, evaluations, or other responses;
          </li>
          <li>
            the content of all messages sent through the website or an Femved
            Wellness application, including information uploaded to social
            networks through the website or an Femved Wellness application or
            otherwise shared with us and/or other users, as well as chat
            messages and chat logs;
          </li>
          <li>
            information about workouts you upload or download using an Femved
            Wellness application;
          </li>
          <li>your newsletter subscriptions;</li>
          <li>any consents you have given us;</li>
          <li>
            any other information input or uploaded by you through the website
            or an Femved Wellness application (e.g., information you provide
            when completing an online form, photos you upload); or
          </li>
          <li>
            data we receive when you log in through social media (e.g., if you
            log in with Facebook).
          </li>
        </ul>

        {/* ── 2 ── */}
        <h2 className="terms__heading">2. How is data collected?</h2>

        <p>
          Personal data is collected by us only if you provide such data to us
          on your own initiative by choosing to use our Services. To be able to
          use our Services, you must register your account with us.
        </p>

        <h3 className="terms__subheading">2.1 Login</h3>

        <p>
          You may create a Femved Wellness user account through our login
          system. Following registration, you will be able to use your user
          account to subscribe to all Femved Wellness Services. To register, you
          must provide us with at least the following information:
        </p>

        <ul className="terms__list terms__list--bullet">
          <li>first and last name,</li>
          <li>e-mail address, and</li>
          <li>password</li>
        </ul>

        <p>
          Before completing the registration process, you must confirm that you
          have read our Privacy Policy and accept our General Terms and
          Conditions.
        </p>

        <h3 className="terms__subheading">
          2.2 Adding information to your user profile
        </h3>

        <p>
          Femved Wellness application(s) also enable you to provide us with
          additional information, such as your gender, fitness level, and
          workout goals. After registering, you can add more information to your
          profile (e.g., a profile photo). If you do so, you will once again
          provide us with personal data. We will also receive data (including
          personal data) from you when you communicate with us or other users
          through a Femved Wellness application. If you create a Femved regime,
          we will receive information about which and how many regimes you have
          completed. We will also receive information about how you use Femved
          Wellness application(s). In that case, too, you will provide us with
          personal data.
        </p>

        <h3 className="terms__subheading">
          2.3 Enabling access rights to your device
        </h3>

        <p>
          For you to be able to use a Femved Wellness application to the full
          extent, we will also need certain access rights to your smart phone.
          For example, we need access to your camera or your photos if you
          upload or want to change a profile photo. We use push messages to send
          you workout reminders or to notify you of new followers or comments.
          When you want to use such a function for the first time, we will ask
          you whether you grant us such access rights or we will ask you to
          grant us access by selecting the appropriate settings. Generally, you
          may revoke such access rights at any time by changing the appropriate
          settings.
        </p>

        <h3 className="terms__subheading">2.4 Newsletter</h3>

        <p>
          You can register for our newsletter. That way, you will receive
          regular updates about the Femved Wellness Services. All you need to
          receive our newsletter is to provide us with a valid e-mail address.
          If you are no longer interested in receiving the newsletter, you may
          unsubscribe at any time using the link that is included in each
          newsletter.
        </p>

        <h3 className="terms__subheading">
          2.5 Linking your account to Facebook
        </h3>

        <p>
          You can also link your Femved Wellness user account to your Facebook
          profile. To do so, simply choose &quot;Login with Facebook&quot;
          during the registration process; you will then be transferred to
          Facebook. There, you will be shown to which Facebook data we will
          receive access. We will store your Facebook e-mail address. This is
          the e-mail address we will use to contact you, if necessary. We will
          also record the fact that you have registered through Facebook.
        </p>

        <h3 className="terms__subheading">2.6 Website</h3>

        <p>
          You will also transfer certain information to us when you access our
          website or Femved Wellness application(s), e.g., your IP address. We
          will also receive data about which terminal device (computer,
          smartphone, tablet, etc.) you are using, which browser (Internet
          Explorer, Safari, Firefox, etc.) you are using, the time at which you
          access the website, the so-called referrer, and the data volume
          transferred. Such data cannot be used by us to identify the user. This
          data is processed for statistical purposes only. Such analyses help us
          make our Services more attractive and, if necessary, to improve our
          Services.
        </p>

        <h3 className="terms__subheading">2.7 Log files</h3>

        <p>
          Every time you access our website the aforementioned data will be
          automatically stored in log files. A log file automatically logs all
          or defined actions on a computer system. Such log files are important,
          for example, for process control and automation. In the case of
          databases a log file tracks changes to the database of correctly
          executed transactions. In the event of an error (e.g., a system
          crash), this allows the current dataset to be restored. Log files are
          also created by web servers. Inter alia, the following data are
          logged: the address of the accessing computer, authentication fields,
          date and time of access, access method, content of HTML access, status
          code of the web server, and information about the browser and
          operating system used by the client.
        </p>

        <h3 className="terms__subheading">
          2.8 Other possible instances of data collection
        </h3>

        <p>
          Collection of data also happens, for example, when you contact us or
          other users, i.e., when you open your Femved Wellness user account,
          sign up for a subscription, upload a profile photo, or use our
          Services to send messages.
        </p>

        {/* ── 3 ── */}
        <h2 className="terms__heading">
          3. What are our legal bases for processing your data?
        </h2>

        <p>
          We will collect, process, and use your personal data and other data to
          support the delivery of Femved Wellness Services in accordance with
          our General Terms and Conditions. In this section we provide
          information on the legal basis for our processing of your Personal
          Data as required by Art. 13 and 14 of the GDPR, as well as provide
          detailed information about the purposes of collection, processing and
          use of your data.
        </p>

        <p>
          We process your data based on the Article 6 of the GDPR relying on the
          following legal bases:
        </p>

        <ul className="terms__list terms__list--bullet">
          <li>performance of our Services, Art. 6(1)b</li>
          <li>legitimate interest relating to our Services, Art. 6(1)f</li>
          <li>
            if you have given us your consent to process your data, Art. 6(1)a
          </li>
          <li>
            if it is necessary for us to comply with a legal obligation Art.
            6(1)c.
          </li>
        </ul>

        <p>
          We may also process the data if it is necessary to protect vital
          interests of our users and/or other people, or for the performance of
          an obligation to carry out in the public interest pursuant to Art.
          6(1) (d) and (e).
        </p>

        {/* ── 4 ── */}
        <h2 className="terms__heading">
          4. What do we use your data for (purposes of processing)?
        </h2>

        <p>
          We will use personal data you have provided to us only if and to the
          extent necessary for providing our Services and handling of the
          contract or if you have consented that we may use your data for the
          purposes described in this Privacy Policy.
        </p>

        <p>
          We process and use data (including personal data) you make available
          to us voluntarily on the website or through the Femved application in
          various situations (e.g., when you send us an e-mail). We also use
          data that are collected automatically on our website or through the
          Femved Wellness application. Finally, we may also receive data about
          you from third parties, for example when another user provides us with
          information about you.
        </p>

        <p>We collect, process and use data for the following purposes:</p>

        <ul className="terms__list terms__list--bullet">
          <li>
            to administer, operate, maintain, and improve the website and Femved
            Wellness application(s);
          </li>
          <li>
            to allow and process orders for services placed by you through the
            website or Femved Wellness application(s);
          </li>
          <li>
            to customize your experience in relation to our website or Femved
            Wellness application(s) (e.g., by tailoring content and offers to
            your personal preferences);
          </li>
          <li>
            to assess your right to receive certain types of offers or services;
          </li>
          <li>
            to support the improvement and customization of the Femved Wellness
            Services;
          </li>
          <li>to analyze and research customer behavior;</li>
          <li>to respond to your questions and inquiries;</li>
          <li>
            to provide you with information about services that may be of
            interest to you;
          </li>
          <li>to communicate with you about certain concerns;</li>
          <li>
            to manage awards, surveys, winning games, lotteries, or other
            promotional activities or events;
          </li>
          <li>
            to comply with our legal obligations to prevent any unlawful use of
            the website or Femved Wellness application(s), to protect the
            security of our Service, to detect and prevent fraud or abuse, to
            settle disputes, and to enforce our contracts;
          </li>
          <li>
            for any other purposes to which you have consented in a particular
            case, or
          </li>
          <li>otherwise as permitted by applicable law.</li>
        </ul>

        <p>
          If required by law, we will ask for your consent before collecting,
          processing, or using your personal data for any of the aforementioned
          purposes.
        </p>

        <p>
          We will also notify you if we want to use your personal data for a new
          or different purpose. We will use your personal data for such other
          purposes only if and to the extent necessary or permitted by
          applicable law or with your consent.
        </p>

        {/* ── 5 ── */}
        <h2 className="terms__heading">
          5. How long and where are data stored?
        </h2>

        <p>
          Your personal data will be stored for as long as this is necessary for
          achieving the defined purposes of processing. If you cancel your user
          account, we will also erase within reasonable time or archive your
          personal data, i.e. restrict processing. An exception applies only if
          we have a legal obligation to archive data for a certain time period.
        </p>

        {/* ── 6 ── */}
        <h2 className="terms__heading">6. Cookies and tracking pixels</h2>

        <p>
          We collect information about visitors to our website and about users
          of our Femved Wellness application(s) in order to improve our
          Services. For this purpose we use different kinds of so-called cookies
          and tracking pixels (a.k.a. web beacons).
        </p>

        <p>
          A cookie allows a web server to place a text file (e.g., a clear ID)
          on your computer or smart phone/tablet. Cookies are used, for example,
          to automatically recognize you the next time you visit our websites or
          use a Femved Wellness application. The cookie is sent either by the
          web server to your browser or is generated by client-side scripting
          (e.g., JavaScript). Cookie data will be stored locally on your
          terminal device and in most cases will be effective only for a limited
          time period.
        </p>

        <p>
          Websites that include flash media write user-specific data to your
          computer and later read such data. Such files are called flash cookies
          or local shared objects (LSO). Such files are not managed by your
          browser, but rather by the flash player plug-in. Flash cookies are
          subject to the same rules as conventional cookies. Flash cookies, too,
          can only be read by the website that caused those flash cookies to be
          placed. However, flash cookies can store a substantially greater
          volume of data.
        </p>

        <p>
          Your browser offers extensive setting options to manage cookies. For
          example, you can deactivate cookies in your browser or limit cookies
          to certain websites. You can also program your browser to first notify
          you before a cookie is placed. You can also choose these settings on
          your mobile terminal devices. You can at any time manage cookies by
          changing the settings of your devices, delete cookies, or block
          cookies altogether.
        </p>

        <p>
          You can also visit our website even if you block cookies on your
          terminal device. If you block cookies, the display of our website may
          however be impaired and not all functions may be available to you. You
          can also use Femved Wellness application(s) without cookies. In that
          case, you may however no longer be able to use all functions of such
          an application as conveniently.
        </p>

        <p>
          Tracking pixels are small graphics in HTML e-mails or on websites.
          When you access such a website, your access to the tracking pixel will
          be recorded in a log file. This allows statistical analysis, which, in
          turn, can be used to improve our Services. You can set your e-mail
          program or your browser so that HTML e-mails will be displayed as text
          only, thereby preventing the use of some tracking pixels.
        </p>

        {/* ── 7 ── */}
        <h2 className="terms__heading">7. Transfer of data to third parties</h2>

        <p>
          Your personal data will be transferred to third parties only if we
          have a legal obligation to do so, if the data transfer is necessary
          for performance of the contract, or if you have consented to the
          transfer of your data. Third-party service providers and partner
          companies will receive your data only if and to the extent necessary
          for performance of the contract or with your consent. In such cases,
          the extent to which data are transferred will however be kept to the
          absolute minimum. To the extent that our service providers come into
          contact with your personal data, we will make sure that they too will
          comply with all applicable data protection laws. Please also read the
          data privacy policies of such third-party providers.
        </p>

        {/* ── 8 ── */}
        <h2 className="terms__heading">
          8. Data processing – third-party services and partners
        </h2>

        <p>
          To be able to offer you all functions and services of Femved Wellness
          application(s) in the most convenient way possible and to be able to
          continuously improve our Services, we use third-party services and
          partners. We also use the assistance of third parties to improve our
          website. Finally, we use certain tools for our marketing.
        </p>

        <p>
          Below is the description of the third-party services we use and for
          what purposes:
        </p>

        <h3 className="terms__subheading">8.1 Google</h3>

        <p>
          We use a number of different Google services (Google Inc., 1600
          Amphitheater Pkwy, Mountain View, CA 94043, U.S.A. – hereinafter
          &quot;Google&quot;) for analysis and marketing purposes. These tools
          collect and statistically analyze data about your use of our Services
          in different ways. We also use your data to show you personalized ads
          with the help of Google services. By using our website or our Femved
          Wellness Services, you consent that we may use your data for these
          purposes.
        </p>

        <p>
          Below (in 8.1.1-8.1.6) we will explain the different services and the
          ways in which you can conveniently revoke your consent, and we provide
          you with additional important information.
        </p>

        <p>
          Additional information about how Google handles data transmitted by us
          is available here:{" "}
          <ExternalLink href="https://www.google.com/intl/de/policies/privacy/partners/">
            https://www.google.com/intl/de/policies/privacy/partners/
          </ExternalLink>
          .
        </p>

        <p>
          You can find additional information about how Google uses cookies in
          the data privacy policy of Google here:{" "}
          <ExternalLink href="https://www.google.com/intl/de/policies/privacy/">
            https://www.google.com/intl/de/policies/privacy/
          </ExternalLink>
          .
        </p>

        <p>
          Information generated by Google tools is generally transferred to a
          server of Google in the United States and stored there. Google and its
          subsidiaries are EU-US Privacy-Shield certified.
        </p>

        <h3 className="terms__subheading">8.1.1 Google Analytics</h3>

        <p>
          Our application(s) and our website use Google Analytics, a web
          analysis program of Google. Google Analytics uses cookies that are
          stored on your terminal device and allows an analysis of your use. We
          activate IP address anonymization so that IP addresses will first be
          truncated by Google within the European Union. On our behalf Google
          uses such information to analyze your use of our Services as well as
          the use of our Services by other users, and provides us with reports
          and other services. The IP address transmitted from your terminal
          device to Google Analytics will not be merged with any other data of
          Google. Google will transfer your data to third parties only if
          permitted by applicable law or in accordance with outsourced data
          processing agreements.
        </p>

        <p>
          You can prevent the collection and processing of information generated
          by the Google cookie by placing an opt-out cookie or deactivating
          Google Analytics in the menu of your terminal device. In the
          alternative, you can also install a browser plug-in, which you will
          find here:{" "}
          <ExternalLink href="https://tools.google.com/dlpage/gaoptout/">
            https://tools.google.com/dlpage/gaoptout/
          </ExternalLink>
          .
        </p>

        <h3 className="terms__subheading">8.1.2 DoubleClick by Google</h3>

        <p>
          DoubleClick uses cookies to show you ads that are relevant to you. In
          the process, a pseudonymous identification number (ID) is assigned to
          you to monitor which ads have been shown in your browser and which ads
          have been clicked. Such cookies contain no personal information.
          DoubleClick cookies allow Google and its partner websites to show ads
          on the basis of previous visits to our website or other websites on
          the Internet. Information generated by such cookies is transferred by
          Google to a server in the United States for analysis, where it is
          stored. Google never merges your data with any other data of Google.
          Data is transferred to third parties by Google only if permitted by
          applicable law or in accordance with outsourced data processing
          agreements.
        </p>

        <p>
          If you do not wish to receive personalized ads, you can place an
          opt-out cookie:{" "}
          <ExternalLink href="https://www.google.de/settings/ads/onweb#display_optout">
            https://www.google.de/settings/ads/onweb#display_optout
          </ExternalLink>
        </p>

        <p>
          You can also install the DoubleClick deactivation browser add-on. You
          will find this browser plug-in here:{" "}
          <ExternalLink href="https://www.google.com/settings/ads/onweb/">
            https://www.google.com/settings/ads/onweb/
          </ExternalLink>
        </p>

        <h3 className="terms__subheading">8.1.3 Google AdWords</h3>

        <p>
          We use Google AdWords to advertise our offers. Following a search on
          Google, our ads will be shown in the areas designated for this
          purpose. Our website registers with the help of cookies how many users
          have found our Services through such ads. We use such data to optimize
          our ads. A cookie is stored by Google when an ad is clicked. You can
          block the cookie by selecting the appropriate settings in your
          browser. In that case, your visit to our website will not be included
          in anonymous user statistics.
        </p>

        <p>
          If you do not wish to receive personalized ads, you can place an
          opt-out cookie:{" "}
          <ExternalLink href="https://www.google.de/settings/ads/onweb#display_optout">
            https://www.google.de/settings/ads/onweb#display_optout
          </ExternalLink>
        </p>

        <p>
          You can also block cookies, for example, by installing an appropriate
          browser plug-in, which is available here:{" "}
          <ExternalLink href="https://support.google.com/ads/answer/7395996?hl=de">
            https://support.google.com/ads/answer/7395996?hl=de
          </ExternalLink>
        </p>

        <h3 className="terms__subheading">8.1.4 Google Dynamic Remarketing</h3>

        <p>
          We use Google Dynamic Remarketing functions on our website. This
          technology allows us to show automatically generated, target
          group-based ads following your visit to our website. The ads shown are
          based on products and services on which you clicked or which you
          viewed during your last visit to our website. Google uses cookies to
          generate interest-based ads. If you do not wish to receive user-based
          ads from Google, you can deactivate ads by selecting the appropriate
          settings of Google.
        </p>

        <p>
          If you do not wish to receive personalized ads, you can place an opt
          out cookie:{" "}
          <ExternalLink href="https://www.google.de/settings/ads/onweb#display_optout">
            https://www.google.de/settings/ads/onweb#display_optout
          </ExternalLink>
        </p>

        <p>
          You can block personalized ads by installing the appropriate browser
          plug-in, which is available here:{" "}
          <ExternalLink href="https://support.google.com/ads/answer/7395996?hl=de">
            https://support.google.com/ads/answer/7395996?hl=de
          </ExternalLink>
        </p>

        <p>
          You can also block personalized ads from Google and other advertising
          networks by opting out on the following page:{" "}
          <ExternalLink href="https://www.youronlinechoices.com/de/praferenzmanagement/">
            https://www.youronlinechoices.com/de/praferenzmanagement/
          </ExternalLink>
        </p>

        <h3 className="terms__subheading">8.1.5 Bubble</h3>

        <p>
          Bubble is a website making tool and a PaaS developed by Bubble Group.
          It can be used by people with limited or no programming experience to
          make web pages. It is a no-code development platform that allows users
          to build a web application; we use Bubble services for hosting and
          maintaining our Web Application. Please check the privacy policies of
          Bubble:{" "}
          <ExternalLink href="https://bubble.io/privacy">
            https://bubble.io/privacy
          </ExternalLink>
        </p>

        <h3 className="terms__subheading">8.1.6 Wix.com</h3>

        <p>
          Wix is a website building platform. This technology and powerful
          built-in features give users the freedom to design professional
          websites with ease that look amazing on any device. We use this
          platform for hosting, maintaining and operations of our website:{" "}
          <ExternalLink href="https://www.wix.com/about/privacy">
            https://www.wix.com/about/privacy
          </ExternalLink>
        </p>

        <h3 className="terms__subheading">8.1.7 Payment platforms</h3>

        <p>
          <strong>1. Third-party payment platforms</strong>
        </p>

        <p>
          Femved Wellness utilizes trusted third-party payment platforms to
          process your financial transactions. These platforms may include, but
          are not limited to, credit card processors, digital wallets, and other
          payment gateways.
        </p>

        <p>
          <strong>Data handling:</strong> When you make a purchase through our
          website, your payment information is securely transmitted to the
          third-party payment platform for processing. Femved Wellness does not
          store your full payment details, such as credit card numbers or bank
          account information.
        </p>

        <p>
          <strong>Security measures:</strong> These third-party platforms employ
          industry-standard encryption and security protocols to protect your
          financial data during transmission and processing. While we take every
          precaution to ensure your data is handled securely, we cannot
          guarantee the security of data transmitted to or from these
          third-party platforms.
        </p>

        <p>
          <strong>Liability:</strong> Femved Wellness is not responsible for any
          issues, including but not limited to unauthorized transactions, data
          breaches, or errors that may occur on the third-party payment
          platform. Any disputes or concerns regarding payments should be
          directed to the respective platform.
        </p>

        <p>
          <strong>
            2. Service providers for order fulfillment and shipping
          </strong>
        </p>

        <p>
          Femved Wellness partners with third-party service providers to ensure
          the efficient fulfillment of your orders and the timely delivery of
          your products.
        </p>

        <p>
          <strong>Data sharing:</strong> To process and fulfill your orders, we
          may share necessary personal information (e.g., name, address, contact
          information) with third-party service providers responsible for order
          processing, packaging, and shipping.
        </p>

        <p>
          <strong>Security measures:</strong> We carefully select our service
          providers and require them to adhere to strict data protection and
          privacy standards. However, once your data is transferred to these
          third-party providers, Femved Wellness cannot control how they manage
          your data.
        </p>

        <p>
          <strong>Liability:</strong> Femved Wellness is not liable for any
          issues that may arise during the order fulfillment and shipping
          process, including delays, lost packages, or data breaches at the
          third-party service provider. Any concerns regarding shipping should
          be addressed directly with the service provider.
        </p>

        <p>You can check their privacy policies here:</p>

        <ul className="terms__list terms__list--bullet">
          <li>
            Stripe:{" "}
            <ExternalLink href="https://stripe.com/in/privacy">
              https://stripe.com/in/privacy
            </ExternalLink>
          </li>
          <li>
            PayPal:{" "}
            <ExternalLink href="https://www.paypal.com/us/legalhub/privacy-full">
              https://www.paypal.com/us/legalhub/privacy-full
            </ExternalLink>
          </li>
          <li>
            Airpay:{" "}
            <ExternalLink href="https://airpay.co.in/privacy-policy">
              https://airpay.co.in/privacy-policy
            </ExternalLink>
          </li>
        </ul>

        <h3 className="terms__subheading">8.2 Social plug-ins</h3>

        <p>We use the following social plug-ins for our website:</p>

        <ul className="terms__list terms__list--bullet">
          <li>
            Facebook (operator: Facebook Inc., 1601 S. California Ave, Palo
            Alto, CA 94304, U.S.A.)
          </li>
          <li>
            Twitter (operator: Twitter Inc., 795 Folsom St., Suite 600, San
            Francisco, CA 94107, U.S.A.)
          </li>
          <li>
            Google+ (operator: Google Inc., 1600 Amphitheatre Parkway, Mountain
            View, CA 94043, U.S.A.)
          </li>
        </ul>

        <p>
          These plug-ins routinely collect data from you and transfer such data
          to servers of the provider.
        </p>

        <p>
          Once activated, such plug-ins will also record your IP address. In
          addition, activated social plug-ins will place a cookie with a clear
          ID when the relevant website is accessed. This also allows providers
          to create profiles of your user behavior. Such a cookie is placed
          whether or not you are a member of the social network. If you are a
          member of a social network and are logged in when you visit our
          website or when you use the Femved Wellness application(s), data and
          information about your visit to our website or your use of an Femved
          Wellness application may be linked to your profile on the social
          network. Please note that we have no control over the exact extent to
          which your data will be collected by social network providers. For
          more information about the extent, type, and purpose of data
          processing and about rights and settings to protect your privacy,
          please refer to the data privacy policy of the relevant social network
          provider. These are available at the following addresses:
        </p>

        <ul className="terms__list terms__list--bullet">
          <li>
            Facebook:{" "}
            <ExternalLink href="https://www.facebook.com/policy.php">
              https://www.facebook.com/policy.php
            </ExternalLink>
          </li>
          <li>
            Twitter:{" "}
            <ExternalLink href="https://twitter.com/privacy/">
              https://twitter.com/privacy/
            </ExternalLink>
          </li>
          <li>
            Google+:{" "}
            <ExternalLink href="https://www.google.com/intl/de/privacy/">
              https://www.google.com/intl/de/privacy/
            </ExternalLink>
          </li>
          <li>
            Instagram:{" "}
            <ExternalLink href="https://help.instagram.com/155833707900388">
              https://help.instagram.com/155833707900388
            </ExternalLink>
            ,{" "}
            <ExternalLink href="https://help.instagram.com/581066165581870/">
              https://help.instagram.com/581066165581870/
            </ExternalLink>
          </li>
        </ul>

        <h3 className="terms__subheading">
          8.2.1 Facebook and Instagram Connect
        </h3>

        <p>
          We use the &quot;Facebook Connect&quot; function, so that you can
          register and log in with us using your Facebook account.
        </p>

        <p>
          If you use Facebook Connect, Facebook/Instagram profile data and
          public data from your Facebook profile will be transferred to us.
          Conversely, data may be transferred from us to your Facebook/Instagram
          profile. Such data are used by us to register you on our website or
          for Femved Wellness application(s) or to allow you to log in. For this
          purpose we also store and process such data.
        </p>

        <p>
          By registering on our website or for an Femved Wellness application
          with the help of Facebook Connect you consent that your profile data
          from your Facebook profile may be transferred to us and, conversely,
          that we may transfer data to Facebook.
        </p>

        <p>
          Please also note that Facebook receives information through Facebook
          Connect about how you use our Femved Wellness application(s) and our
          website.
        </p>

        <p>
          For information about the purpose and extent of data processing, the
          further processing and use of data by Facebook, and your rights and
          setting options to protect your privacy, please refer to the data
          privacy policy of Facebook:{" "}
          <ExternalLink href="https://www.facebook.com/policy.php">
            https://www.facebook.com/policy.php
          </ExternalLink>
          .
        </p>

        <h3 className="terms__subheading">8.3 Pinterest</h3>

        <p>
          On our website we use the &quot;Pin it&quot; button plug-in of
          Pinterest (Pinterest Inc., 635 High Street, Palo Alto, CA, 94301,
          U.S.A.). When you visit our website this plug-in establishes a direct
          connection between your browser and the Pinterest server. This tells
          Pinterest that you have visited our website with your IP address. If
          you are logged into Pinterest during your visit, you can share content
          on Pinterest by clicking on the &quot;Pin it&quot; button. This way,
          Pinterest can also correlate your visit to our website to your
          Pinterest user account. Again, please note that as a website provider,
          we do not know the content of transferred data or how such data are
          used by Pinterest, nor do we have any control over this process. You
          will find the data privacy policy of Pinterest here:{" "}
          <ExternalLink href="https://de.about.pinterest.com/privacy/">
            https://de.about.pinterest.com/privacy/
          </ExternalLink>
          .
        </p>

        <p>
          You can change the settings for the storage of your data here:{" "}
          <ExternalLink href="https://help.pinterest.com/entries/25010303-How-does-Pinterest-use-data-about-other-websites-I-visit">
            https://help.pinterest.com/entries/25010303-How-does-Pinterest-use-data-about-other-websites-I-visit
          </ExternalLink>
          . You can do so whether or not you are a Pinterest user.
        </p>

        <h3 className="terms__subheading">8.6 Facebook Custom Audiences</h3>

        <p>
          We use the remarketing function &quot;Custom Audiences&quot; of
          Facebook Inc. (1601 Willow Road, Menlo Park, California 94025,
          U.S.A.). This function allows us to show visitors of our website and
          users of Femved Wellness application(s) interest-based ads when they
          visit Facebook (&quot;Facebook ads&quot;), and to analyze such
          Facebook ads for statistical and market research purposes, which helps
          us optimize future advertising. For this purpose we use the so-called
          Facebook pixel (website) and Facebook SDK (Femved Wellness
          application).
        </p>

        <p>
          Collected data are anonymous for us and allow no inferences as to your
          identity. Aside from us, Facebook however also stores and processes
          such data. Facebook may correlate such data to your user profile, and
          Facebook may also use such data for its own advertising purposes in
          accordance with the Facebook data privacy policy (
          <ExternalLink href="https://www.facebook.com/about/privacy/">
            https://www.facebook.com/about/privacy/
          </ExternalLink>
          ).
        </p>

        <p>
          Such data may allow Facebook and its partners to show ads on or off
          Facebook or Instagram.
        </p>

        <p>
          Facebook generally also stores such data on servers in the United
          States. Facebook is EU-US Privacy Shield certified.
        </p>

        <p>
          You can generally block the placement of cookies on your computer by
          selecting the appropriate settings in your browser, so that cookies
          will no longer be placed on your computer in the future and/or so that
          cookies that have already been placed will be deleted. If you do so,
          you may no longer be able to correctly use some functions on our
          website.
        </p>

        <p>
          With the help of an appropriate opt-out cookie from Digital
          Advertising Alliance you can also completely deactivate advertising by
          third-party providers such as Facebook:{" "}
          <ExternalLink href="https://www.aboutads.info/choices/">
            https://www.aboutads.info/choices/
          </ExternalLink>
        </p>

        <p>
          In the alternative, you can deactivate the remarketing function
          &quot;Custom Audiences&quot; in your Facebook settings:{" "}
          <ExternalLink href="https://www.facebook.com/settings/?tab=ads#=">
            https://www.facebook.com/settings/?tab=ads#=
          </ExternalLink>
        </p>

        <p>To do so, you must be registered with Facebook.</p>

        {/* ── 9 ── */}
        <h2 className="terms__heading">9. Data security</h2>

        <p>
          Data transfers are generally subject to security gaps. It is
          technically impossible to protect your data 100% from access by third
          parties. However, we strive to minimize this risk as much as possible.
          We therefore maintain state-of-the-art measures to guarantee data
          security and to protect your data from access by third parties. In
          addition, we use strong SSL or TLS encryption for all data transfers.
          However, please make sure not to provide your login data to any third
          parties.
        </p>

        {/* ── 10 ── */}
        <h2 className="terms__heading">10. Websites of third parties</h2>

        <p>
          We occasionally place links to websites of third parties. Although we
          carefully select such third parties, we make no guarantee and assume
          no liability for the correctness or completeness of content or data
          security of any third-party websites. Nor does this Privacy Policy
          apply to linked third-party websites. We assume no responsibility for
          data privacy policies or content of any other websites.
        </p>

        {/* ── 11 ── */}
        <h2 className="terms__heading">11. Changes to this Privacy Policy</h2>

        <p>
          We may need to make changes to this Privacy Policy, for example if we
          add new functions or services to the application. We will however
          notify you of any changes and ask that you read and accept such
          changes before they are implemented by us.
        </p>

        {/* ── 12 ── */}
        <h2 className="terms__heading">
          12. Your rights: information/revocation/erasure and data controller
        </h2>

        <p>
          You may at any time and at no cost request us to provide you
          information about your personal data that are processed by us,
          correction of any errors in your personal data, termination of
          processing of your personal data, or erasure of your personal data –
          subject to mandatory legal provisions or obligations to the contrary.
          In particular, if you qualify as the &quot;data subject&quot; under
          the terms of (GDPR), you have the right to:
        </p>

        <ul className="terms__list terms__list--bullet">
          <li>
            request information on personal data processed by us about you as
            provided by Art. 15 GDPR.
          </li>
          <li>
            in accordance with Art. 16 GDPR, to immediately demand the
            correction of incorrect data or completion of incomplete personal
            data stored with us;
          </li>
          <li>
            pursuant to Art. 17 GDPR, to request deletion of your personal data
            stored by us, unless the processing of the data is required for the
            exercise of the right to freedom of expression and information, for
            the fulfillment of a legal obligation, for reasons of public
            interest or for the assertion, exercise or defense of legal claims;
          </li>
          <li>
            in accordance with Art. 18 GDPR, to request the restriction of the
            processing of your personal data as far as the accuracy of the data
            is disputed by you or the processing is unlawful;
          </li>
          <li>
            in accordance with Art. 20 GDPR, to receive your personal data
            provided to us in a structured, standard and machine-readable format
            or to request transmission to another controller;
          </li>
          <li>
            in accordance with Art. 7 (3) GDPR, to revoke at any time your
            consent previously granted to us. As a result, we will be no longer
            able to continue the data processing based on this consent for the
            future;
          </li>
          <li>
            in accordance with Art. 77 GDPR, users have the right to lodge a
            complaint with a supervisory authority. As a rule, you can contact
            the supervisory authority of your usual place of residence or work
            or our company headquarters for this purpose.
          </li>
        </ul>

        <p>
          also, if your personal data is processed based on legitimate interests
          in accordance with Art. 6 (1) (f) GDPR, you have the right to file an
          objection against the processing of your personal data in accordance
          with Art. 21 GDPR, provided that there are reasons based on your
          particular situation or the objection is directed against direct
          marketing. In the latter case, you have a general right of objection,
          which shall be implemented by us without you specifying any particular
          situation.
        </p>

        {/* ── 13 ── */}
        <h2 className="terms__heading">
          13. Contact details of the Data Controller and Data Protection Officer
        </h2>

        <p>
          To exercise your rights under GDPR, simply contact us at any time by
          letter or e-mail at:
        </p>

        <p>
          <strong>Femved Wellness</strong>
          <br />
          Mumbai, Maharashtra, 400081
        </p>

        <p>
          For all requests concerning the security of your data you can contact
          our data protection officer at{" "}
          <a href="mailto:Femvedwellness@gmail.com" className="terms__link">
            Femvedwellness@gmail.com
          </a>
          .
        </p>
      </div>
    </section>
  );
}
