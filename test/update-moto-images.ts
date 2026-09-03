import db from "../src/lib/db";

async function updatePrize() {
  console.log("Atualizando configurações da moto (Ano 2023, sem quilometragem e sem especificações técnicas)...");

  const prizeImagesJson = JSON.stringify([
    { url: "/images/moto/moto-hero.jpg", title: "Vista Angular Frontal - Honda CG 160 Start" },
    { url: "/images/moto/moto-lateral.jpg", title: "Vista Lateral Completa - Perfil Esportivo" },
    { url: "/images/moto/moto-traseira.jpg", title: "Vista Traseira Angular - Design Moderno" },
    { url: "/images/moto/moto-frontal.jpg", title: "Vista Frontal - Farol e Carenagem" },
  ]);

  await db.campaignSettings.upsert({
    where: { id: "default" },
    update: {
      subtitle: "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal!",
      prizeModel: "Honda CG 160 Start",
      prizeYear: "2023",
      prizeColor: "Azul Metálico",
      prizeMileage: "",
      prizeCondition: "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência",
      prizeDetails: "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor.",
      prizeCoverImage: "/images/moto/moto-hero.jpg",
      prizeImagesJson,
    },
    create: {
      id: "default",
      title: "Ação dos Amigos da Moto",
      subtitle: "Concorra a uma motocicleta Honda CG 160 Start com apuração transparente pela Loteria Federal!",
      prizeModel: "Honda CG 160 Start",
      prizeYear: "2023",
      prizeColor: "Azul Metálico",
      prizeMileage: "",
      prizeCondition: "Semi-nova em excelente estado de conservação, revisada, documentação em dia e pronta para transferência",
      prizeDetails: "Motocicleta Honda CG 160 Start semi-nova em excelente estado de conservação, revisada, com documentação em dia e pronta para transferir ao vencedor.",
      prizeCoverImage: "/images/moto/moto-hero.jpg",
      prizeImagesJson,
      rulesText: "",
    },
  });

  console.log("✓ Banco de dados atualizado com sucesso!");
}

updatePrize()
  .catch(console.error)
  .finally(() => db.$disconnect());
