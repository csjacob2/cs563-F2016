export class SettingsPO {
   Rules: Array<RulePO>;
   Name: string; 
}

export class RulePO {
    Category: Array<any>; 
    Operation: RuleOperation; 
    FriendGroups: any; 
}

export enum RuleOperation {
    'DoNotSend' = 0,
    'Send' = 1
}
