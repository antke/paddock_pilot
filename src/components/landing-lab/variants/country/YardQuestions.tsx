import { Link } from '@tanstack/react-router'

import type { LandingLabVariantProps } from '../../LandingLabPrimitives'
import {
  CountryLabAction,
  CountryLabExample,
  CountryLabPhoto,
  CountryLabShell,
} from './CountryLabKit'
import './yardQuestions.css'

/*
 * THESIS: Lead with the questions a yard asks every day, answer them on the
 * spot, then answer the questions people ask before signing up. Refuses
 * the feature grid; plain, honest conversation carries the offer.
 */

const daily = [
  {
    question: 'When’s the farrier?',
    answer: 'Thursday at 10:30, with Sam Taylor.',
    source: 'Yard calendar',
  },
  {
    question: 'Who did evening feed?',
    answer: 'Priya, at 17:10.',
    source: 'Bramble’s care record',
  },
  {
    question: 'Where’s his passport?',
    answer: 'Saved in Bramble’s documents.',
    source: 'Horse documents',
  },
]

const questions = [
  {
    question: 'Does my whole yard need to join?',
    answer:
      'No. Paddock Pilot works for one owner and one horse. Connect your stable later, if and when it suits you.',
  },
  {
    question: 'Can a friend help without joining my stable?',
    answer:
      'Yes. Invite a sharer, friend or groom to your horse as a viewer or an editor. They don’t need to be part of your yard.',
  },
  {
    question: 'Who can see my horse’s records?',
    answer:
      'You, and the people you invite. Your stable sees the shared calendar and the records you choose to share with it.',
  },
  {
    question: 'What happens if we move yards?',
    answer:
      'Your horse keeps its whole history. The old yard loses access, and the new one sees only what you share.',
  },
  {
    question: 'What can I keep in it?',
    answer:
      'Events, appointments and training, care reminders, health and feeding notes, documents, and contacts for your vet, farrier and other providers.',
  },
  {
    question: 'Does it replace my vet?',
    answer:
      'No. It keeps the records and helps everyone coordinate. Care decisions still belong with your vet and other professionals.',
  },
]

export default function YardQuestions(_props: LandingLabVariantProps) {
  return (
    <CountryLabShell className="yq">
      <section className="yq-hero cty-on-ink" aria-labelledby="yq-hero-title">
        <div className="yq-hero-copy">
          <h1 id="yq-hero-title">
            {daily.map((item) => (
              <span key={item.question}>{item.question}</span>
            ))}
          </h1>
          <p className="cty-lede">
            Paddock Pilot keeps the answers in one place, for you, your horse
            and everyone who helps at the yard.
          </p>
          <CountryLabAction tone="paper" />
        </div>
        <div className="yq-hero-photo">
          <CountryLabPhoto
            name="gate-portrait"
            sizes="(max-width: 899px) 100vw, 44vw"
            priority
            position="25% 35%"
          />
        </div>
      </section>

      <section className="yq-answers" aria-labelledby="yq-answers-title">
        <div className="cty-container">
          <div className="yq-answers-head">
            <h2 id="yq-answers-title" className="yq-answers-title">
              Answered, without a single message.
            </h2>
            <CountryLabExample />
          </div>
          <dl className="yq-answers-grid">
            {daily.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>
                  <span className="yq-answer cty-tnum">{item.answer}</span>
                  <span className="yq-source">{item.source}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="yq-faq" aria-labelledby="yq-faq-title">
        <div className="cty-container yq-faq-grid">
          <div className="yq-faq-intro">
            <h2 id="yq-faq-title" className="cty-h2">
              Fair questions, plain answers.
            </h2>
            <p className="cty-lede">
              The things worth knowing before you add your horse.
            </p>
          </div>
          <dl className="yq-faq-list">
            {questions.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
            <div>
              <dt>What does it cost?</dt>
              <dd>
                Everyday care and yard coordination are part of every account.
                Optional extras are listed on{' '}
                <Link to="/pricing" className="yq-inline-link">
                  Plans
                </Link>
                .
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="cty-close yq-close cty-on-ink"
        aria-labelledby="yq-close-title"
      >
        <div className="cty-container cty-close-grid">
          <h2 id="yq-close-title" className="cty-h2">
            Fewer questions. More riding.
          </h2>
          <div>
            <p className="cty-lede">
              Create your account and add your first horse. The rest of the yard
              can follow.
            </p>
            <CountryLabAction tone="paper" />
          </div>
        </div>
      </section>
    </CountryLabShell>
  )
}
