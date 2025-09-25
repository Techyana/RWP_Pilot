# RWS_Pilot
Ricoh Workshop Portal - Inventory


src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── common/
│   ├── dto/
│   │   └── error-response.dto.ts
│   └── filters/
│       └── all-exceptions.filter.ts
├── database/
│   └── migrations/
│       └── ... (TypeORM migration files)
├── entities/
│   ├── user.entity.ts
│   ├── part.entity.ts
│   ├── device.entity.ts
│   ├── toner.entity.ts
│   ├── part-transaction.entity.ts
│   ├── notification.entity.ts
│   ├── activity-log.entity.ts
│   ├── stripped-part.entity.ts
│   ├── enums/
│   │   ├── part-status.enum.ts
│   │   ├── device-status.enum.ts
│   │   ├── toner-color.enum.ts
│   │   └── transaction-type.enum.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── update-password.dto.ts
│   ├── guards.ts
│   ├── jwt.guard.ts
│   ├── jwt.strategy.ts
│   ├── roles.decorator.ts
│   ├── roles.guard.ts
│   └── types/
│       └── auth-user-payload.type.ts
├── users/
│   ├── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   └── role.enum.ts
├── parts/
│   ├── part.entity.ts
│   ├── parts.controller.ts
│   ├── parts.module.ts
│   ├── parts.service.ts
│   ├── dto/
│   │   ├── create-part.dto.ts
│   │   ├── update-part.dto.ts
│   │   ├── part-response.dto.ts
│   │   └── claim-part.dto.ts
│   └── part-status.enum.ts
├── devices/
│   ├── device.entity.ts
│   ├── devices.controller.ts
│   ├── devices.module.ts
│   ├── devices.service.ts
│   ├── dto/
│   │   ├── create-device.dto.ts
│   │   ├── update-device.dto.ts
│   │   └── device-response.dto.ts
│   └── device-status.enum.ts
├── toners/
│   ├── toner.entity.ts
│   ├── toners.controller.ts
│   ├── toners.module.ts
│   ├── toners.service.ts
│   ├── dto/
│   │   ├── create-toner.dto.ts
│   │   ├── update-toner.dto.ts
│   │   └── toner-response.dto.ts
│   └── toner-color.enum.ts
├── transactions/
│   ├── part-transaction.entity.ts
│   ├── transactions.controller.ts
│   ├── transactions.module.ts
│   ├── transactions.service.ts
│   ├── dto/
│   │   ├── create-transaction.dto.ts
│   │   └── transaction-response.dto.ts
│   └── transaction-type.enum.ts
├── notifications/
│   ├── notification.entity.ts
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   ├── dto/
│   │   ├── create-notification.dto.ts
│   │   └── notification-response.dto.ts
├── activity-logs/
│   ├── activity-log.entity.ts
│   ├── activity-logs.controller.ts
│   ├── activity-logs.module.ts
│   ├── activity-logs.service.ts
│   ├── dto/
│   │   ├── create-activity-log.dto.ts
│   │   └── activity-log-response.dto.ts
├── stripped-parts/
│   ├── stripped-part.entity.ts
│   ├── stripped-parts.controller.ts
│   ├── stripped-parts.module.ts
│   ├── stripped-parts.service.ts
│   ├── dto/
│   │   ├── create-stripped-part.dto.ts
│   │   └── stripped-part-response.dto.ts
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── mail.test.ts
├── seed.ts
└── data-source.ts