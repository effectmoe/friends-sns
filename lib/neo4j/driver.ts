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

// Helper function to convert Neo4j DateTime to ISO string
function convertDateTime(value: any): any {
  if (!value) return value;
  
  // Check if it's a Neo4j DateTime object
  if (value && typeof value === 'object') {
    // Neo4j DateTime with toStandardDate method
    if ('toStandardDate' in value) {
      return value.toStandardDate().toISOString();
    }
    // Neo4j DateTime with year, month, day properties
    if ('year' in value && 'month' in value && 'day' in value) {
      const year = value.year?.low || value.year || 0;
      const month = value.month?.low || value.month || 1;
      const day = value.day?.low || value.day || 1;
      const hour = value.hour?.low || value.hour || 0;
      const minute = value.minute?.low || value.minute || 0;
      const second = value.second?.low || value.second || 0;
      
      return new Date(year, month - 1, day, hour, minute, second).toISOString();
    }
  }
  
  return value;
}

// Helper function to recursively convert DateTime objects in properties
function convertDateTimeInProperties(properties: any): any {
  if (!properties || typeof properties !== 'object') {
    return properties;
  }
  
  const converted: any = {};
  for (const key in properties) {
    if (properties.hasOwnProperty(key)) {
      const value = properties[key];
      converted[key] = convertDateTime(value);
    }
  }
  return converted;
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
        // If it's a Neo4j node, get its properties and convert DateTime
        if (value && value.properties) {
          obj[key] = convertDateTimeInProperties(value.properties);
        } else {
          // For non-node values, also check for DateTime
          obj[key] = convertDateTime(value);
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