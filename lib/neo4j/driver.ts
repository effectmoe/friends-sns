import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Neo4j configuration is missing');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 60 * 1000, // 60 seconds
    });
  }

  return driver;
}

export async function getSession(): Promise<Session> {
  const driver = getDriver();
  return driver.session();
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Helper function to run a query
export async function runQuery<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  const session = await getSession();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => {
      const obj: any = {};
      record.keys.forEach((key) => {
        const value = record.get(key);
        // If it's a Neo4j node, get its properties
        if (value && value.properties) {
          obj[key] = value.properties;
        } else {
          obj[key] = value;
        }
      });
      return obj as T;
    });
  } finally {
    await session.close();
  }
}

// Helper function to run a write transaction
export async function runWriteTransaction<T = any>(
  work: (tx: any) => Promise<T>
): Promise<T> {
  const session = await getSession();
  try {
    return await session.executeWrite(work);
  } finally {
    await session.close();
  }
}

// Helper function to run a read transaction
export async function runReadTransaction<T = any>(
  work: (tx: any) => Promise<T>
): Promise<T> {
  const session = await getSession();
  try {
    return await session.executeRead(work);
  } finally {
    await session.close();
  }
}