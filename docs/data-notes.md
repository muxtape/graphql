# Data notes

Findings from exploring the GraphQL API (tables, fields, units, surprises).

## List of every table i can query

For the below query:
```
{
  __schema {
    queryType {
      fields { name }
    }
  }
}
```

I get:
```
{
  "data": {
    "__schema": {
      "queryType": {
        "fields": [
          {
            "name": "audit"
          },
          {
            "name": "audit_aggregate"
          },
          {
            "name": "audit_by_pk"
          },
          {
            "name": "audit_private"
          },
          {
            "name": "event"
          },
          {
            "name": "event_aggregate"
          },
          {
            "name": "event_by_pk"
          },
          {
            "name": "event_user"
          },
          {
            "name": "event_user_aggregate"
          },
          {
            "name": "event_user_by_pk"
          },
          {
            "name": "event_user_view"
          },
          {
            "name": "event_user_view_aggregate"
          },
          {
            "name": "group"
          },
          {
            "name": "group_aggregate"
          },
          {
            "name": "group_by_pk"
          },
          {
            "name": "group_user"
          },
          {
            "name": "group_user_aggregate"
          },
          {
            "name": "group_user_by_pk"
          },
          {
            "name": "label"
          },
          {
            "name": "label_aggregate"
          },
          {
            "name": "label_by_pk"
          },
          {
            "name": "label_user"
          },
          {
            "name": "label_user_aggregate"
          },
          {
            "name": "label_user_by_pk"
          },
          {
            "name": "latest_progress"
          },
          {
            "name": "markdown"
          },
          {
            "name": "markdown_by_pk"
          },
          {
            "name": "match"
          },
          {
            "name": "match_aggregate"
          },
          {
            "name": "match_by_pk"
          },
          {
            "name": "object"
          },
          {
            "name": "object_aggregate"
          },
          {
            "name": "object_availability"
          },
          {
            "name": "object_availability_aggregate"
          },
          {
            "name": "object_availability_by_pk"
          },
          {
            "name": "object_by_pk"
          },
          {
            "name": "object_child"
          },
          {
            "name": "object_child_aggregate"
          },
          {
            "name": "object_child_by_pk"
          },
          {
            "name": "object_type"
          },
          {
            "name": "object_type_aggregate"
          },
          {
            "name": "object_type_by_pk"
          },
          {
            "name": "path"
          },
          {
            "name": "path_aggregate"
          },
          {
            "name": "path_archive"
          },
          {
            "name": "path_archive_aggregate"
          },
          {
            "name": "path_archive_by_pk"
          },
          {
            "name": "path_by_pk"
          },
          {
            "name": "progress"
          },
          {
            "name": "progress_aggregate"
          },
          {
            "name": "progress_by_path_view"
          },
          {
            "name": "progress_by_path_view_aggregate"
          },
          {
            "name": "progress_by_pk"
          },
          {
            "name": "record"
          },
          {
            "name": "record_by_pk"
          },
          {
            "name": "record_public_view"
          },
          {
            "name": "record_public_view_aggregate"
          },
          {
            "name": "record_type"
          },
          {
            "name": "record_type_by_pk"
          },
          {
            "name": "registration"
          },
          {
            "name": "registration_aggregate"
          },
          {
            "name": "registration_by_pk"
          },
          {
            "name": "registration_user"
          },
          {
            "name": "registration_user_aggregate"
          },
          {
            "name": "registration_user_by_pk"
          },
          {
            "name": "registration_user_view"
          },
          {
            "name": "registration_user_view_aggregate"
          },
          {
            "name": "result"
          },
          {
            "name": "result_aggregate"
          },
          {
            "name": "result_by_pk"
          },
          {
            "name": "role"
          },
          {
            "name": "role_aggregate"
          },
          {
            "name": "role_by_pk"
          },
          {
            "name": "task"
          },
          {
            "name": "task_by_pk"
          },
          {
            "name": "timing"
          },
          {
            "name": "timings"
          },
          {
            "name": "toad_campaign_games"
          },
          {
            "name": "toad_campaign_games_aggregate"
          },
          {
            "name": "toad_campaign_games_by_pk"
          },
          {
            "name": "toad_campaigns"
          },
          {
            "name": "toad_campaigns_by_pk"
          },
          {
            "name": "toad_games"
          },
          {
            "name": "toad_games_aggregate"
          },
          {
            "name": "toad_games_by_pk"
          },
          {
            "name": "toad_session_game_results"
          },
          {
            "name": "toad_session_game_results_by_pk"
          },
          {
            "name": "toad_session_games"
          },
          {
            "name": "toad_session_games_aggregate"
          },
          {
            "name": "toad_session_games_by_pk"
          },
          {
            "name": "toad_sessions"
          },
          {
            "name": "toad_sessions_aggregate"
          },
          {
            "name": "toad_sessions_by_pk"
          },
          {
            "name": "transaction"
          },
          {
            "name": "transaction_aggregate"
          },
          {
            "name": "transaction_by_pk"
          },
          {
            "name": "transaction_type"
          },
          {
            "name": "transaction_type_aggregate"
          },
          {
            "name": "transaction_type_by_pk"
          },
          {
            "name": "user"
          },
          {
            "name": "user_aggregate"
          },
          {
            "name": "user_by_pk"
          },
          {
            "name": "user_public_view"
          },
          {
            "name": "user_role"
          },
          {
            "name": "user_role_aggregate"
          },
          {
            "name": "user_role_by_pk"
          },
          {
            "name": "user_roles_view"
          },
          {
            "name": "user_roles_view_aggregate"
          },
          {
            "name": "xp_view"
          }
        ]
      }
    }
  }
}
```

# Some table's fields and their types

For :
```
{
  __type(name: "user") {
    fields {
      name
      type { name kind ofType { name } }
    }
  }
}
```

I get :
```
{
  "data": {
    "__type": {
      "fields": [
        {
          "name": "attrs",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "jsonb"
            }
          }
        },
        {
          "name": "auditRatio",
          "type": {
            "name": "float8",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "audits",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "auditsAssigned",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "audits_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "audit_aggregate"
            }
          }
        },
        {
          "name": "avatarUrl",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "campus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "createdAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "discordId",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "discordLogin",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "email",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "events",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "events_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "event_user_aggregate"
            }
          }
        },
        {
          "name": "firstName",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "githubId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "groups",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "groupsByCaptainid",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "groupsByCaptainid_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "group_aggregate"
            }
          }
        },
        {
          "name": "groups_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "group_user_aggregate"
            }
          }
        },
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "labels",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "labels_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "label_user_aggregate"
            }
          }
        },
        {
          "name": "lastName",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "login",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "markdowns",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "matches",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "matches_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "match_aggregate"
            }
          }
        },
        {
          "name": "objectAvailabilities",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "objectAvailabilities_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_availability_aggregate"
            }
          }
        },
        {
          "name": "objects",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "objects_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_aggregate"
            }
          }
        },
        {
          "name": "profile",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "jsonb"
            }
          }
        },
        {
          "name": "progresses",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "progressesByPath",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "progressesByPath_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "progress_by_path_view_aggregate"
            }
          }
        },
        {
          "name": "progresses_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "progress_aggregate"
            }
          }
        },
        {
          "name": "public",
          "type": {
            "name": "user_public_view",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "records",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "recordsByAuthorid",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "registrations",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "registrations_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "registration_user_aggregate"
            }
          }
        },
        {
          "name": "results",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "results_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "result_aggregate"
            }
          }
        },
        {
          "name": "roles",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "roles_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "user_roles_view_aggregate"
            }
          }
        },
        {
          "name": "sessions",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "sessions_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "toad_sessions_aggregate"
            }
          }
        },
        {
          "name": "totalDown",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "totalUp",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "totalUpBonus",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "transactions",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "transactions_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "transaction_aggregate"
            }
          }
        },
        {
          "name": "updatedAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "user_roles",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "user_roles_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "user_role_aggregate"
            }
          }
        },
        {
          "name": "xps",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        }
      ]
    }
  }
}
```

For :
```
{
  __type(name: "transaction") {
    fields {
      name
      type { name kind ofType { name } }
    }
  }
}
```

I get:
```
{
  "data": {
    "__type": {
      "fields": [
        {
          "name": "amount",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "numeric"
            }
          }
        },
        {
          "name": "attrs",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "jsonb"
            }
          }
        },
        {
          "name": "auditId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "campus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "createdAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "event",
          "type": {
            "name": "event",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "eventId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "invalidatedAt",
          "type": {
            "name": "timestamptz",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "invalidationReason",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "isBonus",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Boolean"
            }
          }
        },
        {
          "name": "object",
          "type": {
            "name": "object",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "objectId",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "originEvent",
          "type": {
            "name": "event",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "originEventId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "path",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "pathByPath",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "path"
            }
          }
        },
        {
          "name": "progress",
          "type": {
            "name": "progress",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "transaction_type",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "transaction_type"
            }
          }
        },
        {
          "name": "type",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "user",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "user"
            }
          }
        },
        {
          "name": "userId",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "userLogin",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        }
      ]
    }
  }
}
```

For :
```
{
  __type(name: "progress") {
    fields {
      name
      type { name kind ofType { name } }
    }
  }
}
```

I get:
```
{
  "data": {
    "__type": {
      "fields": [
        {
          "name": "campus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "createdAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "event",
          "type": {
            "name": "event",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "eventId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "grade",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "gradedAt",
          "type": {
            "name": "timestamptz",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "group",
          "type": {
            "name": "group",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "groupId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "bigint"
            }
          }
        },
        {
          "name": "isDone",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Boolean"
            }
          }
        },
        {
          "name": "object",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object"
            }
          }
        },
        {
          "name": "objectId",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "path",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "pathByPath",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "path"
            }
          }
        },
        {
          "name": "results",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "results_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "result_aggregate"
            }
          }
        },
        {
          "name": "updatedAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "user",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "user"
            }
          }
        },
        {
          "name": "userId",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "userLogin",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "version",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        }
      ]
    }
  }
}
```

For :
```
{
  __type(name: "result") {
    fields {
      name
      type { name kind ofType { name } }
    }
  }
}
```

I get:
```
{
  "data": {
    "__type": {
      "fields": [
        {
          "name": "attrs",
          "type": {
            "name": "jsonb",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "audits",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "audits_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "audit_aggregate"
            }
          }
        },
        {
          "name": "campus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "createdAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "event",
          "type": {
            "name": "event",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "eventId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "grade",
          "type": {
            "name": "numeric",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "gradedAt",
          "type": {
            "name": "timestamptz",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "group",
          "type": {
            "name": "group",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "groupId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "invalidatedAt",
          "type": {
            "name": "timestamptz",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "invalidationReason",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "isLast",
          "type": {
            "name": "Boolean",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "object",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object"
            }
          }
        },
        {
          "name": "objectId",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "path",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "pathByPath",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "path"
            }
          }
        },
        {
          "name": "type",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "updatedAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "user",
          "type": {
            "name": "user",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "userId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "userLogin",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "version",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        }
      ]
    }
  }
}
```

For :
```
{
  __type(name: "object") {
    fields {
      name
      type { name kind ofType { name } }
    }
  }
}
```

I get:
```
{
  "data": {
    "__type": {
      "fields": [
        {
          "name": "attrs",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "jsonb"
            }
          }
        },
        {
          "name": "author",
          "type": {
            "name": "user",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "authorId",
          "type": {
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "campus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "childrenRelation",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "childrenRelation_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_child_aggregate"
            }
          }
        },
        {
          "name": "createdAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        },
        {
          "name": "events",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "events_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "event_aggregate"
            }
          }
        },
        {
          "name": "groups",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "groups_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "group_aggregate"
            }
          }
        },
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Int"
            }
          }
        },
        {
          "name": "matches",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "matches_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "match_aggregate"
            }
          }
        },
        {
          "name": "name",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "object_type",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_type"
            }
          }
        },
        {
          "name": "objects",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "objects_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_aggregate"
            }
          }
        },
        {
          "name": "parents",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "parents_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "object_child_aggregate"
            }
          }
        },
        {
          "name": "paths",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "paths_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "path_aggregate"
            }
          }
        },
        {
          "name": "progresses",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "progresses_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "progress_aggregate"
            }
          }
        },
        {
          "name": "reference",
          "type": {
            "name": "object",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "registrations",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "registrations_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "registration_aggregate"
            }
          }
        },
        {
          "name": "results",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "results_aggregate",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "result_aggregate"
            }
          }
        },
        {
          "name": "tasks",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": null
            }
          }
        },
        {
          "name": "type",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String"
            }
          }
        },
        {
          "name": "updatedAt",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "timestamptz"
            }
          }
        }
      ]
    }
  }
}
```