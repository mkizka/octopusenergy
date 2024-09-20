type AccountInfo = {
  accountNumber: string;
  email: string;
  password: string;
};

const loadJSON = async (filepath: string) => {
  try {
    const data = await Deno.readTextFile(filepath);
    return JSON.parse(data) as AccountInfo;
  } catch {
    return null;
  }
};

const saveJSON = async (filepath: string, data: AccountInfo) => {
  await Deno.writeTextFile(filepath, JSON.stringify(data));
};

const promptAccountInfo = () => {
  const accountNumber = prompt("Enter your account number:");
  const email = prompt("Enter your email:");
  const password = prompt("Enter your password:");
  if (!accountNumber || !email || !password) {
    throw new Error("Invalid input");
  }
  return { accountNumber, email, password };
};

const ACCOUNT_INFO_PATH = "./account.json";

export const getAccountInfo = async () => {
  const existingAccountInfo = await loadJSON(ACCOUNT_INFO_PATH);
  if (existingAccountInfo) {
    return existingAccountInfo;
  }
  const accountInfo = promptAccountInfo();
  await saveJSON(ACCOUNT_INFO_PATH, accountInfo);
  return accountInfo;
};
