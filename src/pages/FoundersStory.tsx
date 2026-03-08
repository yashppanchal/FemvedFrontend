import "./FoundersStory.scss";
import RevealOnScroll from "../components/RevealOnScroll";

export default function FoundersStory() {
  return (
    <section className="page foundersStory">
      {/* ── Hero ── */}
      <RevealOnScroll className="foundersStory__hero">
        <p className="foundersStory__heroLabel">Our Founders' Story</p>
        <h1 className="foundersStory__heroTitle">
          We understand, and we're here to help.
        </h1>
      </RevealOnScroll>

      {/* ── Opening ── */}
      <RevealOnScroll
        className="foundersStory__section foundersStory__section--opening"
      >
        <div className="foundersStory__prose">
          <p>
            We, the founders, our friends, and every woman we've connected with
            have all been caught in that overwhelming whirlwind of hormonal
            imbalances, anxiety, stress, irregular periods, PCOS,
            Endometriosis, weight gain, acne—the list goes on.
          </p>
          <p>
            It felt like we were trapped in a vicious cycle, where one health
            concern only seemed to lead to another. FemVed is our response to
            the challenges we've faced together, and it's our way of saying to
            you,{" "}
            <em className="foundersStory__highlight">
              "We understand, and we're here to help."
            </em>
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Awakening ── */}
      <RevealOnScroll
        className="foundersStory__section foundersStory__section--awakening"
      >
        <div className="foundersStory__prose">
          <p>
            As we all dig deeper into women's health, we're uncovering some
            startling truths, aren't we? It's shocking to learn that our pads
            and tampons were never tested with real menstrual blood. To know
            that our period pain is{" "}
            <strong className="foundersStory__emphasis">not normal!</strong>
          </p>
          <p className="foundersStory__pullQuote">
            We KNOW now—it's not hysteria.
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Change banner ── */}
      <RevealOnScroll className="foundersStory__banner">
        <p className="foundersStory__bannerText">
          Change is happening all around the globe, and FemVed is honoured to
          be part of this. So, what's our role?
        </p>
      </RevealOnScroll>

      {/* ── Listening ── */}
      <RevealOnScroll
        className="foundersStory__section foundersStory__section--listening"
      >
        <div className="foundersStory__prose">
          <p>
            When we started FemVed, we understood our responsibility. We knew
            we had to provide you with credible and authentic solutions from
            trusted sources, and, of course, they had to come from women. But
            after connecting with all of you, we realised it's about more than
            just offering a product or a quick fix!
          </p>
          <p>
            For a split moment we forgot how overwhelming it is to accept
            solutions when so much has been ignored or misrepresented. If we
            simply continue with the "take this pill and you'll be fine"
            approach, aren't we just going back to the same system we're
            trying to change?
          </p>
          <p>
            We've heard you, truly listened, and taken your thoughts to heart.
            That's why we've created something that helps us all feel more
            connected, understood, and truly supported.
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Revolution ── */}
      <RevealOnScroll className="foundersStory__revolution">
        <h2 className="foundersStory__revolutionTitle">
          The wellness revolution starts here.
        </h2>
      </RevealOnScroll>

      {/* ── Philosophy ── */}
      <RevealOnScroll
        className="foundersStory__section foundersStory__section--philosophy"
      >
        <div className="foundersStory__prose">
          <p>
            Yes, FemVed is all about holistic wellness—drawing from ancient
            wisdom like yoga, Ayurveda, Vedas, and naturopathy to heal both
            mind and body.
          </p>
          <p>
            But we also realised that it's not just about "feeling better."
            True wellness is about understanding all the layers of this wisdom.
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Prakriti ── */}
      <RevealOnScroll
        className="foundersStory__section foundersStory__section--prakriti"
      >
        <div className="foundersStory__prose">
          <p className="foundersStory__prakritiIntro">
            One of the very important aspects of this wisdom is:
          </p>
          <blockquote className="foundersStory__blockquote">
            It teaches that wellness isn't just about you. It's about
            everything around you—<em>Prakriti</em>. Healing isn't just about
            finding a solution; it's a responsibility.
          </blockquote>
        </div>
      </RevealOnScroll>

      {/* ── Closing ── */}
      <RevealOnScroll className="foundersStory__closing">
        <p className="foundersStory__closingText">
          Holistic wellness means self-care, but it's not self-centred. We
          need to heal in a way that impacts everyone around us—and even
          future generations.
        </p>
      </RevealOnScroll>
    </section>
  );
}
