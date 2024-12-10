import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  // Leitura do arquivo JSON
  const data = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './states_and_cities.json'), 'utf-8')
  );

  // Construir mapeamento de UF para stateId
  const ufToStateIdMap = new Map<string, number>();

  for (const stateIdStr in data.states) {
    const stateId = parseInt(stateIdStr, 10);
    const stateName = data.states[stateIdStr];
    const stateNameParts = stateName.split(' - ');
    const uf = stateNameParts[1];
    ufToStateIdMap.set(uf, stateId);
  }

  // Inserção dos estados (se necessário)
  // Verificar se já existem estados inseridos
  const statesCount = await prisma.state.count();
  if (statesCount === 0) {
    console.log('Inserindo estados...');
    const statesData = [];
    for (const stateIdStr in data.states) {
      const stateId = parseInt(stateIdStr, 10);
      const stateName = data.states[stateIdStr];
      statesData.push({
        id: stateId,
        name: stateName,
      });
    }
    await prisma.state.createMany({
      data: statesData,
    });
  }

  // Leitura e parsing do arquivo CSV de cidades
  const citiesCsv = fs.readFileSync(path.resolve(__dirname, './cities.csv'), 'utf-8');
  const citiesRecords = parse(citiesCsv, {
    columns: true,
    delimiter: '|',
    skip_empty_lines: true,
  });

  // Inserção das cidades (se necessário)
  const citiesCount = await prisma.city.count();
  if (citiesCount === 0) {
    console.log('Inserindo cidades...');
    const citiesData = [];
    for (const record of citiesRecords) {
      const id_cidade = parseInt(record.id_cidade.trim(), 10);
      const cidade = record.cidade.trim();
      const uf = record.uf.trim();

      if (isNaN(id_cidade) || !uf) {
        console.warn(`Registro de cidade inválido: ${JSON.stringify(record)}`);
        continue;
      }

      const stateId = ufToStateIdMap.get(uf);
      if (!stateId) {
        console.warn(`UF ${uf} não encontrado no mapeamento de estados.`);
        continue;
      }

      citiesData.push({
        id: id_cidade, // Usando 'id_cidade' como 'id' da cidade
        uf: uf,
        name: cidade,
        stateId: stateId,
      });
    }
    await prisma.city.createMany({
      data: citiesData,
      skipDuplicates: true, // Ignora registros duplicados
    });
  }

  // Leitura e parsing do arquivo CSV de bairros
  const neighborhoodsCsv = fs.readFileSync(
    path.resolve(__dirname, './neighborhoods.csv'),
    'utf-8'
  );
  const neighborhoodsRecords = parse(neighborhoodsCsv, {
    columns: true,
    delimiter: '|',
    skip_empty_lines: true,
  });

  // Mapeamento de id_cidade para cityId no banco
  const cityIdsInDb = new Set<number>(
    (await prisma.city.findMany({ select: { id: true } })).map((city) => city.id)
  );

  // Obter o último id de bairro inserido
  const lastNeighborhood = await prisma.neighborhoods.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  let startIndex = 0;
  if (lastNeighborhood) {
    // Encontrar o índice do próximo bairro a ser inserido
    startIndex = neighborhoodsRecords.findIndex(
      (record) => parseInt(record.id_bairro.trim(), 10) === lastNeighborhood.id
    );
    if (startIndex !== -1) {
      startIndex += 1; // Começar no próximo registro
    } else {
      startIndex = 0; // Se não encontrar, começar do início
    }
  }

  console.log(`Iniciando inserção de bairros a partir do índice ${startIndex}...`);

  // Inserção dos bairros em lotes
  const batchSize = 1000; // Tamanho do lote para inserção em massa

  for (let i = startIndex; i < neighborhoodsRecords.length; i += batchSize) {
    const batch = neighborhoodsRecords.slice(i, i + batchSize);
    const neighborhoodsData = [];

    for (const record of batch) {
      const id_bairro = parseInt(record.id_bairro.trim(), 10);
      const bairro = record.bairro.trim();
      const id_cidade = parseInt(record.id_cidade.trim(), 10);

      if (isNaN(id_bairro) || isNaN(id_cidade)) {
        console.warn(`Registro de bairro inválido: ${JSON.stringify(record)}`);
        continue;
      }

      if (!cityIdsInDb.has(id_cidade)) {
        console.warn(`Cidade com id ${id_cidade} não encontrada no banco de dados.`);
        continue;
      }

      neighborhoodsData.push({
        id: id_bairro,
        idCity: id_cidade,
        cityId: id_cidade,
        name: bairro,
      });
    }

    if (neighborhoodsData.length > 0) {
      try {
        await prisma.neighborhoods.createMany({
          data: neighborhoodsData,
          skipDuplicates: true, // Ignora registros duplicados
        });
        console.log(`Inseridos ${neighborhoodsData.length} bairros.`);
      } catch (error) {
        console.error(`Erro ao inserir bairros: ${error.message}`);
      }
    }
  }

  // Inserção das zonas (se necessário)
  const zonesCount = await prisma.zone.count();
  if (zonesCount === 0) {
    console.log('Inserindo zonas...');
    const zones = [
      { name: 'Central' },
      { name: 'Norte' },
      { name: 'Sul' },
      { name: 'Leste' },
      { name: 'Oeste' },
      { name: 'Não dividida por zona / Cidade pequena' },
    ];

    try {
      await prisma.zone.createMany({
        data: zones,
        skipDuplicates: true,
      });
    } catch (error: any) {
      console.error(`Erro ao inserir zonas: ${error.message}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
