import * as aws from "@pulumi/aws";

export class Config {
    public static readonly Domain: string = "scratch.blinkenlights.org";
    public static readonly Deployment: string = "prod";
}
