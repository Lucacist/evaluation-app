import { db } from "@/db";
// On n'oublie pas d'importer 'referentials'
import { referentials, poles, activities, competenceBlocks, criteria, grades } from "@/db/schema";
import { sql } from "drizzle-orm";

const referentialData = [
  {
    title: "PÔLE 1 : ENTRETIEN PÉRIODIQUE DES VÉHICULES",
    order: 1,
    activities: [
      {
        code: "A1.1",
        title: "ORGANISATION DE L’INTERVENTION",
        blocks: [
          {
            code: "C1.1",
            title: "Prise en charge du véhicule",
            criteria: [
              "Les contrôles visuels sur le véhicule sont réalisés et les défauts sont signalés.",
              "L’ordre de réparation est complété.",
              "Les informations liées à l’historique d’entretien du véhicule sont collectées.",
              "Les protections du véhicule sont correctement mises en place"
            ]
          },
          {
            code: "C1.1",
            title: "Préparation de l’intervention",
            criteria: [
              "Les tâches demandées sur l’ordre de réparation sont prises en compte.",
              "La liste des sous-ensembles, éléments, équipements et produits est transmise et vérifiée.",
              "Les sous-ensembles, éléments, équipements et produits reçus sont conformes.",
              "Les équipements et outillages nécessaires sont disponibles, opérationnels et la validité des contrôles est vérifiée."
            ]
          },
          {
            code: "C1.1",
            title: "Restitution du véhicule",
            criteria: [
              "L’ordre de réparation et les documents internes appropriés sont complétés.",
              "Les travaux réalisés sont conformes à l’ordre de réparation.",
              "Le véhicule est rendu propre, sans aucune trace visible liée à l’intervention.",
              "Le contrôle global du véhicule est réalisé suivant la procédure qualité de l’entreprise"
            ]
          }
        ]
      },
      {
        code: "A1.2",
        title: "RÉALISATION DES CONTRÔLES DÉFINIS PAR UNE PROCÉDURE",
        blocks: [
          {
            code: "C1.2",
            title: "Identification de la liste des contrôles",
            criteria: [
              "L’historique et les spécificités d’utilisation du véhicule sont pris en compte.",
              "Les contrôles à réaliser sont identifiés et hiérarchisés"
            ]
          },
          {
            code: "C1.2",
            title: "Réalisation des contrôles de maintenance périodique",
            criteria: [
              "Les procédures de contrôle visuels et instrumentés sont respectées et appropriées.",
              "Les outils de mesure sont utilisés conformément aux exigences de l’intervention.",
              "Les valeurs mesurées sont comparées aux valeurs définies par les constructeurs.",
              "Les anomalies sont identifiées."
            ]
          },
          {
            code: "C1.2",
            title: "Signalement des éventuelles anomalies",
            criteria: [
              "Les contrôles réalisés sont retranscrits afin d’en assurer leur traçabilité.",
              "Les anomalies, manquements à la réglementation ou dysfonctionnements détectés sont signalés.",
              "Les éléments ou sous-ensembles défectueux sont renseignés sur l’ordre de réparation par ordre de priorité."
            ]
          },
          {
            code: "C1.2",
            title: "Mise à jour des documents de suivi du véhicule",
            criteria: [
              "Les documents de suivi interne sont complétés.",
              "Les informations nécessitant des travaux supplémentaires sont transmises en vue d’un accord client.",
              "Un devis comportant les travaux à prévoir est réalisé."
            ]
          }
        ]
      },
      {
        code: "A1.3",
        title: "REMPLACEMENT DE PIÈCES D’USURE, DE FLUIDES...",
        blocks: [
          {
            code: "C1.3",
            title: "Remplacement des pièces d’usure",
            criteria: [
              "Les pièces d’usure sont remplacées selon les procédures du constructeur.",
              "L’outil de diagnostic est utilisé dans le cadre d’une procédure d’apprentissage de paramétrage ou de réinitialisation.",
              "Les pièces collectées sont stockées conformément aux normes environnementales en vigueur."
            ]
          },
          {
            code: "C1.3",
            title: "Remplacement / ajustement des fluides et pressions",
            criteria: [
              "Les fluides sont remplacés selon le programme d’entretien du véhicule ou selon les anomalies détectées.",
              "Les niveaux des fluides et les pressions des pneumatiques sont ajustés selon les procédures du constructeur.",
              "Les fluides collectés sont stockés conformément aux normes environnementales en vigueur."
            ]
          },
          {
            code: "C1.3",
            title: "Mise à jour de l’ordre de réparation",
            criteria: [
              "Les interventions réalisées sont retranscrites afin d’en assurer leur traçabilité.",
              "Les observations des éventuelles anomalies et des travaux à prévoir sont signalées sur l’ordre de réparation"
            ]
          },
          {
            code: "C1.3",
            title: "Mise à jour des indicateurs de maintenance",
            criteria: [
              "Les indicateurs de maintenance sont mis à jour selon les procédures du constructeur"
            ]
          }
        ]
      },
      {
        code: "A1.4",
        title: "RÉALISATION D'OPÉRATIONS PRÉPARATOIRES AU CONTRÔLE TECHNIQUE",
        blocks: [
          {
            code: "C1.4",
            title: "Identification de la liste des contrôles",
            criteria: [
              "Les contrôles à réaliser sont identifiés conformément aux exigences réglementaires."
            ]
          },
          {
            code: "C1.4",
            title: "Réalisation des contrôles",
            criteria: [
              "Les procédures de contrôle visuels et instrumentés sont respectées et appropriées.",
              "Les outils de mesure sont utilisés conformément aux exigences de l’intervention.",
              "Les valeurs mesurées sont comparées aux valeurs définies par les constructeurs.",
              "Les anomalies sont identifiées."
            ]
          },
          {
            code: "C1.4",
            title: "Signalement des éventuelles anomalies",
            criteria: [
              "Les contrôles réalisés sont retranscrits afin d’en assurer leur traçabilité.",
              "Les anomalies détectées ou manquements à la réglementation sont signalés.",
              "Les éléments ou sous-ensembles défectueux sont renseignés sur l’ordre de réparation par ordre de priorité."
            ]
          }
        ]
      },
      {
        code: "A1.5",
        title: "CONSEILS TECHNIQUES ET D’ENTRETIEN AUPRÈS DE LA CLIENTÈLE",
        blocks: [
          {
            code: "C1.5",
            title: "Proposition d’une intervention complémentaire",
            criteria: [
              "Les anomalies détectées sont expliquées au client.",
              "Les prestations, services et produits additionnels sont proposés selon les exigences réglementaires.",
              "La vente de prestations, services et produits additionnels est présentée et argumentée auprès du client."
            ]
          },
          {
            code: "C1.5",
            title: "Proposition de conseils d’entretien du véhicule",
            criteria: [
              "Le client bénéficie d’un renseignement en lien avec ses pratiques d’usage du véhicule.",
              "Le client est informé du programme d’entretien à venir.",
              "Un conseil à la suite des interventions réalisées est apporté au client."
            ]
          }
        ]
      }
    ]
  },
  {
    title: "PÔLE 2 : MAINTENANCE CORRECTIVE DES VÉHICULES",
    order: 2,
    activities: [
      {
        code: "A2.1",
        title: "PRÉPARATION DE L’INTERVENTION",
        blocks: [
          {
            code: "C2.1",
            title: "Saisie sur l’OR des infos concernant l’intervention",
            criteria: [
              "L'ordre de réparation est complété à chaque étape de l'intervention."
            ]
          },
          {
            code: "C2.1",
            title: "Approvisionnement des sous-ensembles et équipements",
            criteria: [
              "La liste des sous-ensembles, éléments, équipements et produits transmise est vérifiée.",
              "Les sous-ensembles, éléments, équipements et produits reçus sont conformes.",
              "Les équipements et outillages nécessaires sont disponibles, opérationnels et la périodicité des contrôles est respectée."
            ]
          }
        ]
      },
      {
        code: "A2.2",
        title: "REMISE EN CONFORMITÉ DES SYSTÈMES",
        blocks: [
          {
            code: "C2.2",
            title: "Remplacement, réparation des systèmes",
            criteria: [
              "La réparation est effectuée dans le respect des procédures constructeur et de la réglementation.",
              "La dépose et repose des sous-ensembles et des éléments est effectuée dans le respect des procédures."
            ]
          },
          {
            code: "C2.3",
            title: "Réglage, paramétrage des systèmes",
            criteria: [
              "Les réglages et paramétrages sont réalisés dans le respect des procédures du constructeur"
            ]
          },
          {
            code: "C2.4",
            title: "Contrôle de la conformité de l’intervention",
            criteria: [
              "Un contrôle du système est réalisé suivant la procédure et l’intervention respecte les normes en vigueur"
            ]
          },
          {
            code: "C2.4",
            title: "Contrôle de la qualité de l’intervention",
            criteria: [
              "Les opérations de remise en conformité sont retranscrites afin d’en assurer leur traçabilité"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "PÔLE 3 : DIAGNOSTIC DES SYSTÈMES DES VÉHICULES",
    order: 3,
    activities: [
      {
        code: "A3.1",
        title: "RÉALISATION D’UN PRÉ-DIAGNOSTIC",
        blocks: [
          {
            code: "C3.1",
            title: "Collecte des informations préliminaires au diagnostic",
            criteria: [
              "Le recueil des « symptômes client » est réalisé",
              "Les éléments relatifs au véhicule (historique, documentation constructeur) sont collectés",
              "L’essai du véhicule et/ou du système est réalisé en tenant compte de la plainte.",
              "Les tests préliminaires sont réalisés afin de récréer le contexte d’apparition de la panne."
            ]
          },
          {
            code: "C3.1",
            title: "Confirmation, constatation d’un dysfonctionnement",
            criteria: [
              "Le dysfonctionnement et/ou l’anomalie sont confirmés.",
              "L’anomalie détectée est retranscrite afin d’en assurer sa traçabilité."
            ]
          }
        ]
      },
      {
        code: "A3.2",
        title: "RECHERCHE DE PANNES",
        blocks: [
          {
            code: "C3.2",
            title: "Hiérarchisation des hypothèses",
            criteria: [
              "Les éléments relatifs au véhicule (historique, documentation) sont collectés.",
              "Les hypothèses relatives à l’anomalie détectée sont formulées.",
              "Les hypothèses relatives à l’anomalie détectée sont hiérarchisées.",
              "Les protocoles d’intervention permettant de valider les hypothèses sont identifiés."
            ]
          },
          {
            code: "C3.3",
            title: "Mise en œuvre des protocoles d’intervention",
            criteria: [
              "Les protocoles de contrôle et de mesures sont appliqués pour valider les hypothèses.",
              "Les données recueillies sont analysées en tenant compte des valeurs constructeurs.",
              "Les données recueillies permettent de confirmer l’origine de la panne."
            ]
          },
          {
            code: "C3.3",
            title: "Identification des systèmes et éléments défectueux",
            criteria: [
              "Les données recueillies permettent de confirmer l’origine de la panne.",
              "Les systèmes, sous-ensembles ou éléments défectueux sont clairement identifiés.",
              "Les conséquences du dysfonctionnement sont repérées."
            ]
          },
          {
            code: "C3.4",
            title: "Identification des solutions correctives",
            criteria: [
              "Les protocoles d’intervention sont retranscrits afin d’en assurer leur traçabilité.",
              "L’anomalie détectée est retranscrite afin d’en assurer sa traçabilité.",
              "Les opérations de remise en conformité sont identifiées et tiennent compte des faisabilités technique et économique.",
              "Les opérations de remise en conformité sont retranscrites afin d’en assurer leur traçabilité"
            ]
          }
        ]
      }
    ]
  }
];

async function main() {
  console.log("🔥 Nettoyage de la base de données (Référentiel)...");
  
  // 1. SUPPRESSION PROPRE INCLUANT LA TABLE REFERENTIALS
  await db.execute(sql`TRUNCATE TABLE ${grades}, ${criteria}, ${competenceBlocks}, ${activities}, ${poles}, ${referentials} RESTART IDENTITY CASCADE`);

  console.log("🌱 Insertion du nouveau Référentiel complet...");

  // 2. CRÉATION DU RÉFÉRENTIEL PARENT
  const [newRef] = await db.insert(referentials).values({ 
    name: "BTS MV Option A" 
  }).returning();

  console.log(`  > Référentiel créé : ${newRef.name} (ID: ${newRef.id})`);

  // 3. BOUCLE D'INSERTION AVEC LIAISON AU RÉFÉRENTIEL
  for (const poleData of referentialData) {
    // Insérer Pôle (lié au référentiel)
    const [pole] = await db.insert(poles).values({
      title: poleData.title,
      order: poleData.order,
      referentialId: newRef.id
    }).returning();

    console.log(`  > Pôle créé : ${pole.title}`);

    for (const [actIndex, actData] of poleData.activities.entries()) {
      // Insérer Activité
      const [activity] = await db.insert(activities).values({
        poleId: pole.id,
        title: actData.title,
        code: actData.code,
        order: actIndex + 1
      }).returning();

      for (const [blockIndex, blockData] of actData.blocks.entries()) {
        // Insérer Bloc de Compétence
        const [block] = await db.insert(competenceBlocks).values({
          activityId: activity.id,
          title: blockData.title,
          code: blockData.code,
          order: blockIndex + 1
        }).returning();

        // Insérer Critères
        for (const [critIndex, label] of blockData.criteria.entries()) {
          await db.insert(criteria).values({
            blockId: block.id,
            label: label,
            order: critIndex + 1,
            weight: 1
          });
        }
      }
    }
  }

  console.log("✅ Référentiel importé avec succès !");
  process.exit(0);
}

main();