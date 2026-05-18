export interface StepExplanation {
  title: string;
  summary: string;
  explanation: string;
  vulg: string; // Vulgarisation (simplified)
  example: string;
}

export const EXPLANATIONS_FR: StepExplanation[] = [
  {
    title: "Étape 1: L'impuissance",
    summary: "Admettre que nous ne pouvons plus gérer seuls.",
    explanation: "Cette étape est le fondement de tout rétablissement. Il s'agit d'arrêter de se mentir. On admet que notre consommation (drogue, alcool, jeu, etc.) n'est plus un choix, mais une compulsion qui a pris le dessus sur notre volonté. Notre vie est devenue un chaos, même si on essaie de garder les apparences.",
    vulg: "C'est comme essayer de vider l'océan avec une petite cuillère. Tu as beau faire tous les efforts du monde, l'océan gagne toujours. L'étape 1, c'est poser la cuillère et admettre que l'océan est trop grand pour toi seul.",
    example: "Se promettre de ne prendre qu'un verre lors d'un souper et finir la soirée incapable de s'arrêter, ou réaliser que toutes nos économies ont disparu dans des paris malgré nos promesses."
  },
  {
    title: "Étape 2: L'espoir",
    summary: "Croire qu'une aide extérieure est possible.",
    explanation: "Après avoir admis l'échec de notre propre contrôle, on cherche de l'espoir. Cette 'Puissance supérieure' n'est pas forcément religieuse; c'est simplement n'importe quoi qui n'est pas 'nous' (le groupe, la nature, une sagesse universelle). C'est croire que la guérison est possible pour nous aussi.",
    vulg: "Si tu es perdu dans une forêt sombre, l'espoir c'est voir une petite lueur au loin. Tu ne sais pas encore ce que c'est, mais tu sais que tu n'es plus seul dans le noir.",
    example: "Voir un ancien compagnon de consommation qui est maintenant sobre et heureux depuis deux ans. Si ça a marché pour lui, pourquoi pas pour moi ?"
  },
  {
    title: "Étape 3: Le lâcher-prise",
    summary: "Décider de laisser la barre à quelqu'un d'autre.",
    explanation: "C'est l'étape de l'action mentale. On arrête de lutter contre le courant. On accepte de suivre les suggestions du programme au lieu de toujours vouloir faire à notre tête. C'est un acte de confiance profonde.",
    vulg: "C'est comme s'asseoir sur le siège passager d'une voiture. Tu arrêtes d'essayer de conduire depuis l'arrière. Tu laisses quelqu'un qui connaît la route prendre le volant.",
    example: "Au lieu de planifier notre propre plan de sobriété compliqué, on décide de simplement aller aux réunions et d'appeler notre parrain quand on a une envie, même si on n'en a pas envie."
  },
  {
    title: "Étape 4: L'inventaire",
    summary: "Faire face à sa propre vérité.",
    explanation: "On fait le ménage. On écrit nos ressentiments, nos peurs et nos comportements passés. Le but n'est pas de se culpabiliser, mais de comprendre 'comment on fonctionne' pour ne plus répéter les mêmes erreurs.",
    vulg: "C'est comme vider un vieux placard qui déborde. Tu sors tout sur le plancher, tu regardes ce qui est brisé, ce qui peut être réparé et ce qu'il faut jeter.",
    example: "Écrire une liste de toutes les personnes contre qui on a de la colère et réaliser que notre propre orgueil ou insécurité était souvent à la base du conflit."
  },
  {
    title: "Étape 5: Le partage",
    summary: "Sortir de l'isolement du secret.",
    explanation: "On raconte notre inventaire à une autre personne de confiance (souvent le parrain). Partager nos secrets les plus honteux nous libère du poids du passé. On réalise qu'on est humain et qu'on n'est pas les seuls à avoir fait des erreurs.",
    vulg: "Porter un secret pesant, c'est comme porter un sac de briques. En en parlant à quelqu'un, le sac devient soudainement beaucoup plus léger parce que quelqu'un d'autre nous aide à le porter.",
    example: "Dire enfin tout haut cet acte dont on a eu honte pendant 10 ans et entendre son parrain répondre : 'Moi aussi j'ai fait quelque chose de similaire.' "
  },
  {
    title: "Étape 6: La préparation",
    summary: "Devenir prêt à changer en profondeur.",
    explanation: "On regarde nos défauts de caractère (colère, égoïsme, paresse) et on se demande : 'Suis-je vraiment prêt à m'en débarrasser ?'. Parfois, on s'accroche à nos défauts parce qu'ils nous sont familiers. Cette étape demande de l'humilité.",
    vulg: "C'est comme attendre que la peinture sèche. Tu as bien nettoyé le mur (Étape 4 et 5), maintenant tu attends d'être psychologiquement prêt à appliquer une nouvelle couleur.",
    example: "Réaliser que notre sarcasme blesse les gens et décider qu'on est tanné de cette solitude que notre comportement crée."
  },
  {
    title: "Étape 7: L'humilité",
    summary: "Demander de l'aide pour changer.",
    explanation: "On demande humblement à notre Puissance supérieure de nous aider à changer ces défauts. On reconnaît qu'on ne peut pas 's'auto-réparer' simplement par la force de volonté. C'est une étape de transformation.",
    vulg: "C'est comme demander à un mécanicien de réparer ton moteur. Tu admets que tu ne sais pas comment faire et tu le laisses travailler sur tes parties brisées.",
    example: "Prier ou méditer chaque matin en demandant la force de ne pas être colérique aujourd'hui, au lieu d'essayer de 'serrer les dents' tout seul."
  },
  {
    title: "Étape 8: La liste",
    summary: "Identifier ceux qu'on a blessés.",
    explanation: "On dresse la liste des personnes à qui on a fait du tort. On ne pense pas encore à ce qu'on va leur dire, on veut juste être honnête sur les dommages qu'on a causés. On se prépare à devenir responsable.",
    vulg: "C'est comme faire le bilan des dégâts après une tempête. Tu fais le tour de la maison des voisins pour voir quelles vitres tu as cassées.",
    example: "Mettre sur papier le nom de notre ex-conjoint, de nos parents et même de cet ancien patron à qui on a volé du temps ou de l'argent."
  },
  {
    title: "Étape 9: Les réparations",
    summary: "Faire amende honorable.",
    explanation: "C'est l'action concrète. On va voir les gens pour s'excuser et réparer ce qui peut l'être (rembourser une dette, admettre un mensonge). On ne le fait que si ça ne blesse personne d'autre. Le but est de retrouver la paix d'esprit.",
    vulg: "C'est aller réparer la clôture du voisin que tu as brisée. Ce n'est pas juste dire 'désolé', c'est apporter tes outils et ton bois pour reconstruire.",
    example: "Appeler un vieil ami pour lui dire : 'J'ai été un mauvais ami à cause de ma consommation, je m'en excuse et je veux savoir comment je peux me racheter.' "
  },
  {
    title: "Étape 10: La vigilance",
    summary: "Continuer l'inventaire au quotidien.",
    explanation: "On ne veut pas laisser les problèmes s'accumuler à nouveau. Chaque soir, on regarde notre journée. Si on a eu tort, on l'admet tout de suite au lieu d'attendre. C'est la maintenance du rétablissement.",
    vulg: "C'est comme faire la vaisselle après chaque repas au lieu d'attendre que la pile remplisse l'évier. Ça garde la cuisine (ton esprit) propre tout le temps.",
    example: "S'excuser immédiatement auprès d'un collègue après avoir été brusque en réunion, au lieu de ruminer toute la soirée."
  },
  {
    title: "Étape 11: La connexion",
    summary: "Nourrir sa vie spirituelle.",
    explanation: "On cherche à approfondir notre contact avec quelque chose de plus grand que nous. On utilise la méditation et la prière pour trouver la sérénité et savoir quoi faire de notre vie. On cherche le calme dans la tempête.",
    vulg: "C'est comme recharger la batterie de ton téléphone. Si tu ne le branches pas chaque jour, il finit par s'éteindre. L'étape 11, c'est ton chargeur spirituel.",
    example: "Prendre 10 minutes de silence chaque matin pour respirer et demander : 'Qu'est-ce que je peux faire de bon aujourd'hui ?' "
  },
  {
    title: "Étape 12: La transmission",
    summary: "Aider les autres et pratiquer les principes.",
    explanation: "On a reçu un cadeau (la liberté), maintenant on doit le redonner. En aidant un autre dépendant, on solidifie notre propre rétablissement. On essaie d'appliquer la bienveillance dans tout ce qu'on fait.",
    vulg: "C'est comme devenir à ton tour un guide de montagne. Maintenant que tu connais le sentier et ses dangers, tu aides les nouveaux à grimper sans tomber.",
    example: "Aller parler à un nouveau membre après une réunion pour lui dire qu'il n'est pas seul, ou rester après pour aider à ranger les chaises avec le sourire."
  }
];

export const EXPLANATIONS_EN: StepExplanation[] = [
  {
    title: "Step 1: Powerlessness",
    summary: "Admitting we can no longer manage on our own.",
    explanation: "This step is the foundation of all recovery. It's about stopping the lies. We admit that our usage is no longer a choice, but a compulsion that has overridden our will. Our lives have become chaotic, even if we try to keep up appearances.",
    vulg: "It's like trying to empty the ocean with a teaspoon. No matter how much effort you put in, the ocean always wins. Step 1 is putting down the spoon and admitting the ocean is too big for you alone.",
    example: "Promising yourself only one drink at dinner and ending the night unable to stop, or realizing all your savings are gone on bets despite your promises."
  },
  {
    title: "Step 2: Hope",
    summary: "Believing that outside help is possible.",
    explanation: "After admitting the failure of our own control, we look for hope. This 'Higher Power' isn't necessarily religious; it's simply anything that isn't 'us' (the group, nature, universal wisdom). It's believing that healing is possible for us too.",
    vulg: "If you're lost in a dark forest, hope is seeing a small light in the distance. You don't know what it is yet, but you know you're no longer alone in the dark.",
    example: "Seeing a former using buddy who has now been sober and happy for two years. If it worked for them, why not for me?"
  },
  {
    title: "Step 3: Letting Go",
    summary: "Deciding to let someone else take the wheel.",
    explanation: "This is the step of mental action. We stop fighting the current. We agree to follow the program's suggestions instead of always wanting to do things our way. It's an act of profound trust.",
    vulg: "It's like sitting in the passenger seat of a car. You stop trying to drive from the back. You let someone who knows the road take the wheel.",
    example: "Instead of planning our own complicated sobriety plan, we decide to just go to meetings and call our sponsor when we have an urge, even if we don't feel like it."
  },
  {
    title: "Step 4: Inventory",
    summary: "Facing our own truth.",
    explanation: "We clean house. We write down our resentments, fears, and past behaviors. The goal isn't to guilt-trip ourselves, but to understand 'how we work' so we don't repeat the same mistakes.",
    vulg: "It's like emptying an old, overflowing closet. You pull everything out onto the floor, look at what's broken, what can be fixed, and what needs to be thrown away.",
    example: "Writing a list of everyone we're angry with and realizing our own pride or insecurity was often at the root of the conflict."
  },
  {
    title: "Step 5: Sharing",
    summary: "Getting out of the isolation of secrets.",
    explanation: "We share our inventory with another trusted person (often the sponsor). Sharing our most shameful secrets frees us from the weight of the past. We realize we're human and we're not the only ones who have made mistakes.",
    vulg: "Carrying a heavy secret is like carrying a bag of bricks. By talking to someone, the bag suddenly becomes much lighter because someone else is helping us carry it.",
    example: "Finally saying out loud that act you've been ashamed of for 10 years and hearing your sponsor reply: 'I've done something similar too.' "
  },
  {
    title: "Step 6: Preparation",
    summary: "Becoming ready for deep change.",
    explanation: "We look at our character defects (anger, selfishness, laziness) and ask ourselves: 'Am I truly ready to let go of these?'. Sometimes we cling to our flaws because they're familiar. This step requires humility.",
    vulg: "It's like waiting for paint to dry. You've cleaned the wall well (Steps 4 and 5), now you're waiting to be psychologically ready to apply a new color.",
    example: "Realizing our sarcasm hurts people and deciding we're tired of the loneliness our behavior creates."
  },
  {
    title: "Step 7: Humility",
    summary: "Asking for help to change.",
    explanation: "We humbly ask our Higher Power to help us change these defects. We recognize we can't 'fix ourselves' simply through willpower. It's a step of transformation.",
    vulg: "It's like asking a mechanic to fix your engine. You admit you don't know how and let them work on your broken parts.",
    example: "Praying or meditating each morning asking for the strength not to be angry today, instead of trying to 'grit your teeth' all on your own."
  },
  {
    title: "Step 8: The List",
    summary: "Identifying those we have harmed.",
    explanation: "We make a list of the people we've wronged. We aren't thinking about what we'll say yet; we just want to be honest about the damage we've caused. We're preparing to become accountable.",
    vulg: "It's like assessing the damage after a storm. You go around the neighbors' houses to see which windows you broke.",
    example: "Putting on paper the name of our ex-partner, our parents, and even that former boss from whom we stole time or money."
  },
  {
    title: "Step 9: Amends",
    summary: "Making things right.",
    explanation: "This is concrete action. We go see people to apologize and repair what can be repaired (repaying a debt, admitting a lie). We only do it if it doesn't harm anyone else. The goal is to find peace of mind.",
    vulg: "It's going to fix the neighbor's fence you broke. It's not just saying 'sorry'; it's bringing your tools and wood to rebuild.",
    example: "Calling an old friend to say: 'I was a bad friend because of my usage, I apologize and I want to know how I can make it up to you.' "
  },
  {
    title: "Step 10: Vigilance",
    summary: "Continuing daily inventory.",
    explanation: "We don't want to let problems pile up again. Every night, we look at our day. If we were wrong, we admit it right away instead of waiting. This is the maintenance of recovery.",
    vulg: "It's like doing the dishes after every meal instead of waiting for the pile to fill the sink. It keeps the kitchen (your mind) clean all the time.",
    example: "Immediately apologizing to a colleague after being blunt in a meeting, instead of ruminating all evening."
  },
  {
    title: "Step 11: Connection",
    summary: "Nourishing one's spiritual life.",
    explanation: "We seek to deepen our contact with something greater than ourselves. We use meditation and prayer to find serenity and know what to do with our lives. We seek calm in the storm.",
    vulg: "It's like charging your phone's battery. If you don't plug it in every day, it eventually dies. Step 11 is your spiritual charger.",
    example: "Taking 10 minutes of silence each morning to breathe and ask: 'What good can I do today?' "
  },
  {
    title: "Step 12: Service",
    summary: "Helping others and practicing principles.",
    explanation: "We've received a gift (freedom), now we must give it back. By helping another addict, we solidify our own recovery. We try to practice kindness in everything we do.",
    vulg: "It's like becoming a mountain guide yourself. Now that you know the trail and its dangers, you help newcomers climb without falling.",
    example: "Going to talk to a new member after a meeting to tell them they're not alone, or staying late to help put away chairs with a smile."
  }
];
