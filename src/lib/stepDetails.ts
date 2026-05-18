
export type StepDetail = {
  title: string;
  explanation: string;
  examples: string[];
};

export const stepDetails: Record<'fr' | 'en', Record<number, StepDetail>> = {
  fr: {
    1: {
      title: "Étape 1 : L'Honnêteté",
      explanation: "On arrête de se conter des peurs. C'est le moment où on réalise que notre consommation (ou notre comportement) mène le show et qu'on n'a plus le contrôle sur le volant de notre propre vie. C'est pas une défaite, c'est un constat de réalité.",
      examples: [
        "Réaliser que j'ai dit que j'en prendrais juste un, mais que j'ai fini la soirée dans le décor.",
        "Admettre que mes relations sont scrap à cause de mes choix.",
        "Arrêter d'accuser les autres pour mes propres problèmes."
      ]
    },
    2: {
      title: "Étape 2 : L'Espoir",
      explanation: "On commence à croire que c'est possible de s'en sortir. Pas besoin d'être religieux; c'est juste de se dire qu'il y a quelque chose de plus grand que notre propre petite tête de cochon qui peut nous ramener sur le droit chemin.",
      examples: [
        "Regarder un 'old-timer' en meeting et se dire : 'S'il l'a fait, je suis capable aussi'.",
        "Confier son anxiété à la nature ou au groupe.",
        "Accepter qu'on n'a pas toutes les réponses."
      ]
    },
    3: {
      title: "Étape 3 : La Foi",
      explanation: "C'est le lâcher-prise. On décide d'arrêter de vouloir tout micro-gérer et on fait confiance au processus. On remet nos problèmes entre les mains de notre Puissance Supérieure (celle qu'on a choisie).",
      examples: [
        "Dire 'Que ta volonté soit faite' quand une situation nous dépasse.",
        "Arrêter de vouloir manipuler les gens pour avoir ce qu'on veut.",
        "Prendre la décision de suivre le programme au lieu de nos vieilles idées."
      ]
    },
    4: {
      title: "Étape 4 : Le Courage",
      explanation: "On fait le grand ménage. On prend un papier pis un crayon, pis on regarde en face nos bibittes, nos peurs, pis nos ressentiments. C'est un inventaire honnête de qui on est, sans se censurer.",
      examples: [
        "Écrire la liste des personnes contre qui on a une crotte sur le cœur.",
        "Identifier nos propres patterns de comportement qui nous nuisent.",
        "Être franc sur nos peurs les plus profondes."
      ]
    },
    5: {
      title: "Étape 5 : L'Intégrité",
      explanation: "On sort de l'isolement. On avoue nos gaffes et notre vraie nature à une autre personne (souvent notre parrain). C'est là que le poids sur nos épaules commence vraiment à décoller.",
      examples: [
        "Raconter à son parrain des secrets qu'on n'a jamais dits à personne.",
        "Admettre notre part de responsabilité dans nos vieux conflits.",
        "Se regarder dans le miroir avec moins de honte après avoir tout déballé."
      ]
    },
    6: {
      title: "Étape 6 : La Volonté",
      explanation: "On se prépare au changement. On regarde nos défauts de caractère (comme l'orgueil ou la colère) et on se dit qu'on est prêt à ce qu'ils ne mènent plus nos vies. C'est une étape de préparation intérieure.",
      examples: [
        "Réaliser que notre besoin d'avoir toujours raison nous isole.",
        "Vouloir sincèrement arrêter de manipuler les gens.",
        "Se dire qu'on ne veut plus être l'esclave de nos impulsions."
      ]
    },
    7: {
      title: "Étape 7 : L'Humilité",
      explanation: "On demande de l'aide pour changer. On réalise qu'on ne peut pas 'guérir' nos défauts tout seul. C'est l'acte de demander humblement à notre Puissance Supérieure de nous libérer de ce qui nous bloque.",
      examples: [
        "Prier ou méditer pour demander de la patience au lieu de pogner les nerfs.",
        "Accepter nos limites sans se rabaisser.",
        "Admettre qu'on a besoin de force extérieure pour rester zen."
      ]
    },
    8: {
      title: "Étape 8 : L'Amour",
      explanation: "On prépare le terrain de la réconciliation. On fait la liste de tout le monde qu'on a blessé dans le passé. On ne va pas les voir encore, on fait juste devenir prêt à faire amende honorable.",
      examples: [
        "Faire la liste de nos ex, de nos parents, de nos anciens boss.",
        "Penser à l'argent qu'on doit ou au temps qu'on a fait perdre.",
        "Vouloir sincèrement réparer le mal qu'on a fait."
      ]
    },
    9: {
      title: "Étape 9 : La Justice",
      explanation: "C'est l'action. On va voir les gens de la liste et on répare le trouble qu'on a fait, direct, sauf si ça va leur causer plus de tort. C'est là qu'on retrouve notre dignité.",
      examples: [
        "Rembourser une vieille dette sans faire d'excuses bidon.",
        "S'excuser sincèrement à un proche pour notre comportement passé.",
        "Faire du bénévolat pour compenser une situation qu'on ne peut pas réparer directement."
      ]
    },
    10: {
      title: "Étape 10 : La Vigilance",
      explanation: "C'est la maintenance. On continue de s'observer chaque jour. Si on fait une gaffe, on l'admet tout de suite au lieu de laisser traîner. Ça évite que les poubelles s'accumulent.",
      examples: [
        "Prendre 5 minutes le soir pour repenser à sa journée.",
        "S'excuser le jour même si on a manqué de respect à quelqu'un.",
        "Surveiller si nos vieux démons (impatience, égo) reviennent."
      ]
    },
    11: {
      title: "Étape 11 : La Spiritualité",
      explanation: "On entretient la connexion. Par la prière ou la méditation, on essaie de mieux comprendre ce que la vie (ou notre Puissance Supérieure) attend de nous. On cherche la paix intérieure.",
      examples: [
        "S'asseoir en silence 10 minutes par jour pour calmer le mental.",
        "Écouter son intuition profonde au lieu de ses impulsions.",
        "Demander de la guidance avant de prendre une grosse décision."
      ]
    },
    12: {
      title: "Étape 12 : Le Service",
      explanation: "On redonne au suivant. Fort de notre éveil spirituel, on aide d'autres personnes qui souffrent encore. C'est en aidant les autres qu'on garde notre propre sobriété.",
      examples: [
        "Devenir parrain pour un nouveau membre.",
        "Partager son histoire dans un meeting pour donner de l'espoir.",
        "Appliquer les principes de patience et d'honnêteté au travail et en famille."
      ]
    }
  },
  en: {
    1: {
      title: "Step 1: Honesty",
      explanation: "We stop lying to ourselves. It's the moment we realize our addiction (or behavior) is running the show and we've lost control of the steering wheel of our own lives. It's not a defeat, it's a reality check.",
      examples: [
        "Realizing I said I'd only take one, but ended the night in a mess.",
        "Admitting that my relationships are broken because of my choices.",
        "Stop blaming others for my own problems."
      ]
    },
    // ... I will fill the rest of the English steps with equally original and simple content
    2: {
      title: "Step 2: Hope",
      explanation: "We start to believe that recovery is possible. No need to be religious; it's just about realizing there's something bigger than our own stubbornness that can lead us back to sanity.",
      examples: [
        "Looking at an 'old-timer' in a meeting and thinking: 'If they did it, I can too'.",
        "Trusting nature or the group with your anxiety.",
        "Accepting that we don't have all the answers."
      ]
    },
    3: {
      title: "Step 3: Faith",
      explanation: "This is about letting go. We decide to stop micro-managing everything and trust the process. We turn our problems over to our Higher Power (as we define it).",
      examples: [
        "Saying 'Thy will be done' when a situation is beyond our control.",
        "Stop trying to manipulate people to get what we want.",
        "Deciding to follow the program instead of our own old ideas."
      ]
    },
    4: {
      title: "Step 4: Courage",
      explanation: "We do a deep clean. We take a paper and pen and face our fears, resentments, and characters. It's an honest inventory of who we are, without censorship.",
      examples: [
        "Writing a list of people we hold a grudge against.",
        "Identifying our own harmful patterns of behavior.",
        "Being frank about our deepest fears."
      ]
    },
    5: {
      title: "Step 5: Integrity",
      explanation: "We come out of isolation. We admit our mistakes and our true nature to another person (usually our sponsor). This is where the weight truly builds off our shoulders.",
      examples: [
        "Telling our sponsor secrets we've never told anyone.",
        "Admitting our part in old conflicts.",
        "Looking in the mirror with less shame after letting it all out."
      ]
    },
    6: {
      title: "Step 6: Willingness",
      explanation: "We prepare for change. We look at our character defects (like pride or anger) and tell ourselves we're ready for them not to run our lives anymore.",
      examples: [
        "Realizing that our need to always be right isolates us.",
        "Sincerely wanting to stop manipulating people.",
        "Telling ourselves we no longer want to be a slave to our impulses."
      ]
    },
    7: {
      title: "Step 7: Humility",
      explanation: "We ask for help to change. We realize we cannot 'heal' our defects alone. It's the act of humbly asking our Higher Power to release us from what blocks us.",
      examples: [
        "Praying or meditating for patience instead of getting angry.",
        "Accepting our limits without putting ourselves down.",
        "Admitting we need external strength to stay zen."
      ]
    },
    8: {
      title: "Step 8: Love",
      explanation: "We lay the groundwork for reconciliation. We list everyone we've hurt in the past. We don't go see them yet; we just become willing to make amends.",
      examples: [
        "Listing our exes, parents, and former bosses.",
        "Thinking about money we owe or time we wasted for others.",
        "Sincerely wanting to repair the harm we've caused."
      ]
    },
    9: {
      title: "Step 9: Justice",
      explanation: "This is action. We go see the people on our list and make things right, directly, unless it would cause them more harm. This is where we regain our dignity.",
      examples: [
        "Repaying an old debt without making excuses.",
        "Sincerely apologizing to a loved one for our past behavior.",
        "Volunteering to compensate for a situation we can't fix directly."
      ]
    },
    10: {
      title: "Step 10: Vigilance",
      explanation: "This is maintenance. We continue to observe ourselves daily. If we make a mistake, we admit it immediately instead of letting it linger.",
      examples: [
        "Taking 5 minutes at night to review the day.",
        "Apologizing the same day if we've been disrespectful.",
        "Watching if our old demons (impatience, ego) are returning."
      ]
    },
    11: {
      title: "Step 11: Spirituality",
      explanation: "We nurture the connection. Through prayer or meditation, we try to better understand what life (or our Higher Power) expects from us. We seek inner peace.",
      examples: [
        "Sitting in silence for 10 minutes a day to calm the mind.",
        "Listening to deep intuition instead of impulses.",
        "Asking for guidance before a major decision."
      ]
    },
    12: {
      title: "Step 12: Service",
      explanation: "We give back. Following our spiritual awakening, we help others who are still suffering. By helping others, we keep our own sobriety.",
      examples: [
        "Becoming a sponsor for a new member.",
        "Sharing our story in a meeting to give hope.",
        "Applying principles of patience and honesty at work and in family."
      ]
    }
  }
};
