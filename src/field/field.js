import {reduce} from 'lodash';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLScalarType
} from 'graphql';
import {getModels} from './../model';
import {getTypes, nodeInterface} from './../type';
import {
  getIdFetcher,
  getOneResolver,
  getListResolver
} from './../query';

function getField(graffitiModel, type) {
  const {name} = type;
  const singularName = name.toLowerCase();
  const pluralName = `${name.toLowerCase()}s`;

  return {
    [singularName]: {
      type: type,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: `The ID of a ${name}`
        }
      },
      resolve: getOneResolver(graffitiModel)
    },
    [pluralName]: {
      type: new GraphQLList(type),
      args: reduce(type._typeConfig.fields(), (args, field) => {
        if (field.type instanceof GraphQLNonNull && field.name !== 'id') {
          field.type = field.type.ofType;
        }

        if (field.type instanceof GraphQLScalarType) {
          args[field.name] = field;
        }

        return args;
      }, {
        id: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        },
        ids: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        }
      }),
      resolve: getListResolver(graffitiModel)
    }
  };
}

function getFields(graffitiModels) {
  const types = getTypes(graffitiModels);

  const queries = reduce(types, (queries, type, key) => {
    type.name = type.name || key;
    const graffitiModel = graffitiModels[type.name];
    return {
      ...queries,
      ...getField(graffitiModel, type)
    };
  }, {});

  queries.node = {
    name: 'node',
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID of an object'
      }
    },
    resolve: getIdFetcher(graffitiModels)
  };

  const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: queries
  });

  return {
    query: RootQuery
  };
}

function getSchema(mongooseModels) {
  const graffitiModels = getModels(mongooseModels);
  const fields = getFields(graffitiModels);
  return new GraphQLSchema(fields);
}

export default {
  getField,
  getFields,
  getSchema
};
