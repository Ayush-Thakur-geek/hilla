import { NumberModel, ObjectModel, StringModel, _getPropertyModel } from '@hilla/form';
import type { CrudService } from '../src/crud';
import type Filter from '../src/types/dev/hilla/crud/filter/Filter';
import type PropertyStringFilter from '../src/types/dev/hilla/crud/filter/PropertyStringFilter';
import type Pageable from '../src/types/dev/hilla/mappedtypes/Pageable';
import Direction from '../src/types/org/springframework/data/domain/Sort/Direction';

export interface Company {
  name: string;
  foundedDate: string;
}
export interface Person {
  firstName: string;
  lastName: string;
  email: string;
  someNumber: number;
}

export class PersonModel<T extends Person = Person> extends ObjectModel<T> {
  declare static createEmptyValue: () => Person;

  get firstName(): StringModel {
    return this[_getPropertyModel]('firstName', StringModel, [false]);
  }

  get lastName(): StringModel {
    return this[_getPropertyModel]('firstName', StringModel, [false]);
  }

  get email(): StringModel {
    return this[_getPropertyModel]('email', StringModel, [false]);
  }

  get someNumber(): NumberModel {
    return this[_getPropertyModel]('someNumber', NumberModel, [false]);
  }
}

export class CompanyModel<T extends Company = Company> extends ObjectModel<T> {
  declare static createEmptyValue: () => Company;

  get name(): StringModel {
    return this[_getPropertyModel]('name', StringModel, [false]);
  }

  get foundedDate(): StringModel {
    return this[_getPropertyModel]('foundedDate', StringModel, [false]);
  }
}

const createService = <T>(data: T[]) => {
  let _lastFilter: Filter | undefined;

  return {
    list: async (request: Pageable, filter: Filter | undefined): Promise<T[]> => {
      _lastFilter = filter;
      let filteredData: T[] = [];
      if (request.pageNumber === 0) {
        /* eslint-disable */
        if (filter && (filter as any).t === 'propertyString') {
          const propertyFilter: PropertyStringFilter = filter as PropertyStringFilter;
          filteredData = data.filter((item) => {
            const propertyValue = (item as any)[propertyFilter.propertyId];
            if (propertyFilter.matcher === 'CONTAINS') {
              return propertyValue.includes(propertyFilter.filterValue);
            }
            return propertyValue === propertyFilter.filterValue;
          });
        } else {
          filteredData = data;
        }
        /* eslint-enable */
      }

      if (request.sort.orders.length === 1) {
        const sortPropertyId = request.sort.orders[0]!.property;
        const directionMod = request.sort.orders[0]!.direction === Direction.ASC ? 1 : -1;
        filteredData.sort((a, b) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (a as any)[sortPropertyId] > (b as any)[sortPropertyId] ? Number(directionMod) : -1 * directionMod,
        );
      }
      return filteredData;
    },
    get lastFilter() {
      return _lastFilter;
    },
  };
};

const personData: Person[] = [
  { firstName: 'John', lastName: 'Dove', email: 'john@example.com', someNumber: 12 },
  { firstName: 'Jane', lastName: 'Love', email: 'jane@example.com', someNumber: 55 },
];

const companyData: Company[] = [
  { name: 'Vaadin Ltd', foundedDate: '2000-05-06' },
  { name: 'Google', foundedDate: '1998-09-04' },
];
type HasLastFilter = { lastFilter: Filter | undefined };

export const personService: CrudService<Person> & HasLastFilter = createService(personData);
export const companyService: CrudService<Company> & HasLastFilter = createService(companyData);