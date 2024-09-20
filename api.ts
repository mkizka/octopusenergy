import { getAccountInfo } from "./account.ts";
import { requestGraphql } from "./graphql.ts";
import { TZDate } from "npm:@date-fns/tz";

const loginQuery = `
  mutation login($input: ObtainJSONWebTokenInput!) {
    obtainKrakenToken(input: $input) {
      token
      refreshToken
    }
  }
`;

type LoginResponse = {
  obtainKrakenToken: {
    token: string;
    refreshToken: string;
  };
};

const halfHourlyReadingsQuery = `
query halfHourlyReadings($accountNumber: String!, $fromDatetime: DateTime, $toDatetime: DateTime) {
  account(accountNumber: $accountNumber) {
    properties {
      electricitySupplyPoints {
        halfHourlyReadings(fromDatetime: $fromDatetime, toDatetime: $toDatetime) {
          startAt
          value
          costEstimate
        }
      }
    }
  }
}
`;

type HalhHourlyReadingResponse = {
  account: {
    properties: {
      electricitySupplyPoints: {
        halfHourlyReadings: {
          startAt: string;
          value: string;
          costEstimate: string;
        }[];
      }[];
    }[];
  };
};

export const getHalfHourlyReadings = async () => {
  const accountInfo = await getAccountInfo();
  const loginResponse = await requestGraphql<LoginResponse>({
    query: loginQuery,
    variables: {
      input: {
        email: accountInfo.email,
        password: accountInfo.password,
      },
    },
  });

  const now = TZDate.tz("Asia/Tokyo");
  const thisMonth = new TZDate(
    now.getFullYear(),
    now.getMonth(),
    1,
    "Asia/Tokyo",
  );

  const response = await requestGraphql<HalhHourlyReadingResponse>({
    query: halfHourlyReadingsQuery,
    variables: {
      accountNumber: accountInfo.accountNumber,
      fromDatetime: thisMonth.toISOString(),
      toDatetime: now.toISOString(),
    },
    headers: {
      Authorization: loginResponse.data.obtainKrakenToken.token,
    },
  });
  const { halfHourlyReadings } =
    response.data.account.properties[0].electricitySupplyPoints[0];
  return halfHourlyReadings;
};
